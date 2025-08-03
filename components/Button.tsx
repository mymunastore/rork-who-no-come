import React from "react";
import { 
  ActivityIndicator, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  ViewStyle,
  TextStyle,
  StyleProp
} from "react-native";
import { Colors } from "@/constants/colors";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  testID,
}) => {
  const getButtonStyle = (): StyleProp<ViewStyle> => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...sizeStyles[size],
    };

    if (disabled) {
      return [baseStyle, variantStyles[variant], styles.disabled, style];
    }

    return [baseStyle, variantStyles[variant], style];
  };

  const getTextStyle = (): StyleProp<TextStyle> => {
    const baseTextStyle = {
      ...styles.text,
      ...textSizeStyles[size],
    };

    if (variant === "outline" || variant === "ghost") {
      return [
        baseTextStyle, 
        { color: disabled ? Colors.textLight : getTextColor(variant) },
        textStyle
      ];
    }

    return [
      baseTextStyle, 
      { color: disabled ? Colors.textLight : getTextColor(variant) },
      textStyle
    ];
  };

  const getTextColor = (variant: ButtonVariant): string => {
    switch (variant) {
      case "primary":
        return Colors.background;
      case "secondary":
        return Colors.background;
      case "outline":
        return Colors.primary;
      case "ghost":
        return Colors.primary;
      case "danger":
        return Colors.background;
      default:
        return Colors.background;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      activeOpacity={0.8}
    >
      <View style={getButtonStyle()}>
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={variant === "outline" || variant === "ghost" ? Colors.primary : Colors.background} 
          />
        ) : (
          <>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={getTextStyle()}>{title}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  outline: {
    backgroundColor: "transparent",
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  danger: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
};

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  small: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  medium: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  large: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
};

const textSizeStyles: Record<ButtonSize, TextStyle> = {
  small: {
    fontSize: 12,
  },
  medium: {
    fontSize: 14,
  },
  large: {
    fontSize: 16,
  },
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  disabled: {
    opacity: 0.6,
  },
  iconContainer: {
    marginRight: 8,
  },
});