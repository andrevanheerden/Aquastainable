import { useRouter } from "expo-router";
import { useCallback } from "react";

import SplashScreen from "./splash";

export default function Index() {
  const router = useRouter();

  const handleFinish = useCallback(() => {
    router.replace("/loading");
  }, [router]);

  return <SplashScreen onFinish={handleFinish} />;
}
