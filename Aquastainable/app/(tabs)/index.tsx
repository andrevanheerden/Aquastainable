import { StyleSheet, Text, View } from "react-native";

import Colors from "@/Aquastainable/app/colors";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aquastainable</Text>
      <Text style={styles.subtitle}>Welcome to your app.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 10,
  },
  subtitle: {
    color: Colors.lightBlue,
    fontSize: 16,
    textAlign: "center",
  },
});
