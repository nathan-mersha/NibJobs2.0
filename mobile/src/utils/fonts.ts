import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';

export const useAppFonts = () => {
  const [fontsLoaded] = useFonts({
    'Roboto-Regular': Roboto_400Regular,
    'Roboto-Medium': Roboto_500Medium,
    'Roboto-Bold': Roboto_700Bold,
  });

  return fontsLoaded;
};

export const fonts = {
  regular: 'Roboto-Regular',
  medium: 'Roboto-Medium', 
  bold: 'Roboto-Bold',
};

export default fonts;