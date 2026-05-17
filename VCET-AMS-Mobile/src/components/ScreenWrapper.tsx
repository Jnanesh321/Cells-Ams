import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, View } from 'react-native';

type ScreenWrapperProps = {
  children: React.ReactNode;
  scroll?: boolean;
  className?: string;
};

export default function ScreenWrapper({ children, scroll = true, className = '' }: ScreenWrapperProps) {
  const content = (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className={`flex-1 bg-slate-950 ${className}`}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      {children}
    </KeyboardAvoidingView>
  );

  if (scroll) {
    return (
      <ScrollView
        className="flex-1 bg-slate-950"
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
