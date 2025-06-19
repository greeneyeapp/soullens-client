import AsyncStorage from '@react-native-async-storage/async-storage';

const CREDIT_KEY = 'user_credits';

export const getCredits = async (): Promise<number> => {
  try {
    const credits = await AsyncStorage.getItem(CREDIT_KEY);
    return credits ? parseInt(credits, 10) : 0;
  } catch (error) {
    console.error('Kredi okuma hatası:', error);
    return 0;
  }
};

export const setCredits = async (value: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(CREDIT_KEY, value.toString());
  } catch (error) {
    console.error('Kredi yazma hatası:', error);
  }
};

export const incrementCredits = async (amount: number): Promise<void> => {
  const current = await getCredits();
  await setCredits(current + amount);
};

export const decrementCredits = async (amount: number): Promise<boolean> => {
  const current = await getCredits();
  if (current >= amount) {
    await setCredits(current - amount);
    return true;
  } else {
    return false;
  }
};
