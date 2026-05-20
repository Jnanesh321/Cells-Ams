import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

const Card: React.FC<CardProps> = ({ children, className = '', style }) => {
  const { colors } = useAppTheme();

  return (
    <View
      className={`rounded-lg shadow-md p-4 my-2 ${className}`}
      style={[{
        backgroundColor: colors.bgCard,
        borderColor: colors.border,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      }, style]}
    >
      {children}
    </View>
  );
};

export default Card;
