import React from 'react';
import { View } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <View
      className={`bg-slate-800 rounded-lg shadow-md p-4 my-2 border border-slate-700 ${className}`}
    >
      {children}
    </View>
  );
};

export default Card;
