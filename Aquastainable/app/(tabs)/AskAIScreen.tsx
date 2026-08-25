import HoldButton from '@/components/ui/HoldButton';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, SafeAreaView, Text, View, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { Feather } from '@expo/vector-icons';
import { ThemeType } from '../theme';

import WaveBackground from '../../components/AiAssistant/WaveBackground';
import Header, { HoldIconButton } from '../../components/AiAssistant/Header';
import HeroSection from '../../components/AiAssistant/HeroSection';
import SuggestionPills from '../../components/AiAssistant/SuggestionPills';
import ActionToggles from '../../components/AiAssistant/ActionToggles';
import InputBar from '../../components/AiAssistant/InputBar';
import { auth } from '@/firebase';
import { useTankApi } from '../hooks/useTankApi';
import { useFishApi } from '../hooks/useFishApi';
import { usePlantApi } from '../hooks/usePlantApi';
import useAiApi, { AiChat, AiChatMessage } from '../hooks/useAiApi';

export default function AskAIScreen() {
  const params = useLocalSearchParams<{
    theme?: ThemeType;
    prefillText?: string;
    prefillMediaUri?: string;
    prefillMediaType?: 'image' | 'video';
    prefillMediaUris?: string;
    prefillSpeciesName?: string;
  }>();

  const initialTheme = params.theme ?? 'default';
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(initialTheme);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [tanks, setTanks] = useState<any[]>([]);
  const [fish, setFish] = useState<any[]>([]);
  const [plants, setPlants] = useState<any[]>([]);
  const [selection, setSelection] = useState({ tankIds: [] as string[], speciesIds: [] as string[] });
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [chatId, setChatId] = useState<string | undefined>();
  const [chats, setChats] = useState<AiChat[]>([]);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const prefillText = params.prefillText ?? '';
  const prefillMediaUri = params.prefillMediaUri ?? null;
  const prefillMediaType = params.prefillMediaType ?? null;
  const prefillMediaUris = (() => {
    try { return params.prefillMediaUris ? JSON.parse(params.prefillMediaUris) as string[] : []; } catch { return []; }
  })();
  const [pendingMediaUris, setPendingMediaUris] = useState<string[]>(() => Array.from(new Set([
    ...prefillMediaUris,
    ...(prefillMediaUri ? [prefillMediaUri] : []),
  ])));
  const prefillSpeciesName = params.prefillSpeciesName ?? '';
  const { getUserTanks } = useTankApi();
  const { getUserFish } = useFishApi();
  const { getUserPlants } = usePlantApi();
  const { askAssistant, getChats, getChat, deleteChat, loading } = useAiApi();

  useEffect(() => onAuthStateChanged(auth, (user) => setUserId(user?.uid ?? null)), []);
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);
  useEffect(() => {
    if (!userId) return;
    Promise.all([getUserTanks(userId), getUserFish(userId), getUserPlants(userId)])
      .then(([nextTanks, nextFish, nextPlants]) => {
        setTanks(Array.isArray(nextTanks) ? nextTanks : []);
        setFish(Array.isArray(nextFish) ? nextFish : []);
        setPlants(Array.isArray(nextPlants) ? nextPlants : []);
      }).catch(() => undefined);
  }, [userId, getUserTanks, getUserFish, getUserPlants]);

  const loadChats = async () => {
    if (!userId) return;
    setChats(await getChats(userId));
    setHistoryVisible(true);
  };

  const openChat = async (selectedChat: AiChat) => {
    if (!userId) return;
    const fullChat = await getChat(userId, selectedChat.id);
    setChatId(fullChat.id);
    setMessages(fullChat.messages || []);
    setHistoryVisible(false);
  };

  const removeChat = async (selectedChat: AiChat) => {
    if (!userId) return;
    try {
      await deleteChat(userId, selectedChat.id);
      setChats((current) => current.filter((chat) => chat.id !== selectedChat.id));
      if (chatId === selectedChat.id) {
        setChatId(undefined);
        setMessages([]);
      }
      Alert.alert('Chat deleted', 'The chat and its messages were deleted.');
    } catch (error) {
      Alert.alert('Could not delete chat', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const getCurrentContext = () => ({
    tanks: selection.tankIds.length ? tanks.filter((tank) => selection.tankIds.includes(tank.tankId || tank.id)) : tanks,
    fish: selection.speciesIds.length ? fish.filter((item) => selection.speciesIds.includes(item.fishId || item.id)) : fish,
    plants: selection.speciesIds.length ? plants.filter((item) => selection.speciesIds.includes(item.plantId || item.id)) : plants,
    selectedTankIds: selection.tankIds,
    selectedSpeciesIds: selection.speciesIds,
    mode: currentTheme === 'crimson' ? 'sickness and problems' : currentTheme === 'emerald' ? 'water quality and care' : currentTheme === 'midnight' ? 'tank planning and stocking' : 'general aquarium question',
  });

  const sendMessage = async (message: string, retryIndex?: number, mediaUri?: string) => {
    if (!userId || loading) return;
    const retriedMessage = retryIndex === undefined ? undefined : messages[retryIndex];
    const context = retriedMessage?.context ?? { ...getCurrentContext(), ...(prefillSpeciesName ? { sicknessSpecies: prefillSpeciesName } : {}) };
    const historyMessages = retryIndex === undefined ? messages : messages.slice(0, retryIndex);
    const images = retryIndex === undefined
      ? Array.from(new Set([...pendingMediaUris, ...(mediaUri ? [mediaUri] : [])]))
      : retriedMessage?.imageUrls;
    if (retryIndex === undefined) setPendingMediaUris([]);
    const optimistic: AiChatMessage = { ...retriedMessage, question: message, answer: '', context, imageUrls: images };
    setMessages((current) => retryIndex === undefined
      ? [...current, optimistic]
      : current.map((item, index) => index === retryIndex ? optimistic : item));
    try {
      const result = await askAssistant({
        userId,
        chatId,
        message,
        context,
        images,
        history: historyMessages.flatMap((item) => [{ role: 'user' as const, content: item.question }, ...(item.answer ? [{ role: 'assistant' as const, content: item.answer }] : [])]),
      });
      setChatId(result.chatId);
      setMessages((current) => retryIndex === undefined
        ? [...current.slice(0, -1), { question: message, answer: result.answer, context, imageUrls: result.imageUrls }]
        : current.map((item, index) => index === retryIndex ? { ...item, answer: result.answer, context } : item));
    } catch {
      setMessages((current) => retryIndex === undefined
        ? [...current.slice(0, -1), { question: message, answer: 'I could not reach the aquarium assistant. Please try again.', context }]
        : current.map((item, index) => index === retryIndex ? { ...item, answer: 'I could not reach the aquarium assistant. Please try again.', context } : item));
    }
  };

  const tankOptions = tanks.map((tank) => ({ id: tank.tankId || tank.id, label: tank.tankName || 'Unnamed tank', kind: 'tank' as const }));
  const speciesOptions = [...fish.map((item) => ({ id: item.fishId || item.id, label: item.name || item.FBname || 'Fish', kind: 'fish' as const })), ...plants.map((item) => ({ id: item.plantId || item.id, label: item.name || 'Plant', kind: 'plant' as const }))];

  return (
    <WaveBackground theme={currentTheme}>
      <SafeAreaView style={[styles.safeArea, keyboardVisible && styles.safeAreaKeyboard]}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <Header onMenu={loadChats} />

          <View style={styles.content}>
            {messages.length ? (
              <ScrollView
                style={styles.chatScroll}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}
                keyboardDismissMode="none"
                keyboardShouldPersistTaps="always"
              >
                {messages.map((item, index) => (
                  <View key={`${item.question}-${index}`} style={styles.messageBlock}>
                    <View style={styles.questionCard}>
                      <Text style={styles.question}>{item.question}</Text>
                      {item.imageUrls?.length ? (
                        <View style={styles.questionImages}>
                          {item.imageUrls.slice(0, 3).map((imageUrl) => <Image key={imageUrl} source={{ uri: imageUrl }} style={styles.questionImage} />)}
                        </View>
                      ) : null}
                    </View>
                    <View style={styles.answerBlock}>
                      {item.answer ? <Text style={styles.answer}>{item.answer}</Text> : <ActivityIndicator color="#2E8CA6" />}
                    </View>
                    {item.answer ? (
                        <HoldButton style={styles.retryButton} onHold={() => sendMessage(item.question, index)} disabled={loading} accessibilityLabel="Hold to retry question">
                        <Feather name="rotate-cw" size={14} color="#A8C4CB" />
                        <Text style={styles.retryText}>Retry</Text>
                      </HoldButton>
                    ) : null}
                  </View>
                ))}
              </ScrollView>
            ) : (
              <>
                <HeroSection logoSource={null} />
                <SuggestionPills
                  activeTheme={currentTheme}
                  onSelectPill={(theme: ThemeType) => setCurrentTheme(theme)}
                />
              </>
            )}
          </View>

          {showMediaOptions ? (
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowMediaOptions(false)} />
          ) : null}

          {!messages.length ? <View style={styles.bottomSection}>
            <ActionToggles tanks={tankOptions} species={speciesOptions} onSelectionChange={setSelection} />
          </View> : null}

          <View style={styles.inputLayer} pointerEvents="box-none">
            <InputBar
              initialText={prefillText}
              initialMediaUri={prefillMediaUri}
              initialMediaUris={pendingMediaUris}
              initialMediaType={prefillMediaType}
              showOptions={showMediaOptions}
              onShowOptionsChange={setShowMediaOptions}
              onSend={(message, mediaUri) => sendMessage(message, undefined, mediaUri)}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <Modal visible={historyVisible} transparent animationType="slide" onRequestClose={() => setHistoryVisible(false)}>
        <View style={styles.historyBackdrop}>
          <View style={styles.historyPanel}>
            <View style={styles.historyHeader}>
              <View>
                <Text style={styles.historyEyebrow}>AQUESTANABLE</Text>
                <Text style={styles.historyTitle}>Your chats</Text>
              </View>
              <HoldIconButton onHold={() => setHistoryVisible(false)} icon="x" label="Hold to close chat history" />
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.historyList}>
              {chats.length ? chats.map((chat) => (
                <View key={chat.id} style={styles.chatRow}>
                  <TouchableOpacity style={styles.chatOpen} onPress={() => openChat(chat)} activeOpacity={0.75}>
                    <View style={styles.chatIcon}><Feather name="message-circle" size={18} color="#A8C4CB" /></View>
                    <View style={styles.chatDetails}>
                      <Text style={styles.chatTitle} numberOfLines={1}>{chat.title}</Text>
                      <Text style={styles.chatDate}>{new Date(chat.updatedAt).toLocaleDateString()}</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.45)" />
                  </TouchableOpacity>
                  <HoldIconButton onHold={() => { void removeChat(chat); }} icon="trash-2" fillColor="rgba(235, 87, 87, 0.9)" label={`Hold to delete ${chat.title}`} />
                </View>
              )) : <Text style={styles.emptyChats}>Your saved conversations will appear here.</Text>}
            </ScrollView>
            <HoldButton style={styles.newChatButton} onHold={() => { setChatId(undefined); setMessages([]); setHistoryVisible(false); }} activeOpacity={0.8} accessibilityLabel="Hold to start new chat">
              <Feather name="plus" size={18} color="#FFFFFF" />
              <Text style={styles.newChat}>New chat</Text>
            </HoldButton>
          </View>
        </View>
      </Modal>
    </WaveBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  safeAreaKeyboard: {
    paddingBottom: 8,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    paddingTop: 12,
    paddingBottom: 20,
  },
  inputLayer: {
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  bottomSection: {
    width: '100%',
  },
  bottomSectionOnTop: {
    zIndex: 2,
    position: 'relative',
  },
  messageBlock: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  questionCard: {
    alignSelf: 'flex-end',
    maxWidth: '92%',
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
  answerBlock: {
    paddingHorizontal: 4,
    paddingTop: 12,
  },
  question: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  questionImages: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  questionImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  answer: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 14,
    lineHeight: 21,
  },
  retryButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 4,
  },
  retryText: {
    color: '#A8C4CB',
    fontSize: 13,
    fontWeight: '600',
  },
  historyBackdrop: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  historyPanel: {
    marginTop: 44,
    marginHorizontal: 14,
    marginBottom: 14,
    flex: 1,
    padding: 18,
    borderRadius: 24,
    backgroundColor: '#16151A',
    borderWidth: 1,
    borderColor: 'rgba(168,196,203,0.18)',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  historyEyebrow: {
    color: '#6C98A0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  historyTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  historyList: {
    paddingVertical: 14,
    flexGrow: 1,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chatOpen: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(46,140,166,0.2)',
  },
  chatDetails: {
    flex: 1,
  },
  deleteButton: {
    width: 38,
    height: 38,
    marginLeft: 10,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(235,87,87,0.12)',
  },
  chatTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  chatDate: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    marginTop: 4,
  },
  newChat: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyChats: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 36,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#2E8CA6',
  },
});