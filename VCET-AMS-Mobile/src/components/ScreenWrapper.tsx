import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

type ScreenWrapperProps = {
  children: React.ReactNode;
  scroll?: boolean;
  className?: string;
};

export default function ScreenWrapper({ children, scroll = true, className = '' }: ScreenWrapperProps) {
  const { colors } = useAppTheme();

  const content = (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className={`flex-1 ${className}`}
      style={{ backgroundColor: colors.bg }}
    >
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.statusBarBg} />
      {children}
    </KeyboardAvoidingView>
  );

  if (scroll) {
    return (
      <ScrollView
        style={{ backgroundColor: colors.bg }}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
}
