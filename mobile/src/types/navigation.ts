// Navigation parameter lists for type-safe navigation

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  JobDetail: {
    jobId: string;
  };
  Auth: {
    redirectTo?: keyof RootStackParamList;
  };
  CategorySelection: undefined;
};

export type TabParamList = {
  Home: undefined;
  Profile: undefined;
};

// Screen props types for type-safe navigation
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> =
  BottomTabScreenProps<TabParamList, T>;

// Combined navigation prop type
export type NavigationProps = RootStackScreenProps<keyof RootStackParamList>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}