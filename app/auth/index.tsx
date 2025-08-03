import React, { useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { Mail, Lock, User, Phone, Truck } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useAuth } from "@/hooks/auth-store";
import { UserRole } from "@/types";

export default function AuthScreen() {
  const router = useRouter();
  const { login, signup, isLoading } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>("customer");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";
    
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    
    if (!isLogin) {
      if (!name) newErrors.name = "Name is required";
      if (!phone) newErrors.phone = "Phone number is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    if (isLogin) {
      const success = await login(email, password, role);
      if (success) {
        router.replace("/(tabs)");
      } else {
        setErrors({ form: "Invalid email or password" });
      }
    } else {
      const success = await signup({ name, email, phone, role }, password);
      if (success) {
        router.replace("/(tabs)");
      } else {
        setErrors({ form: "Failed to create account" });
      }
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" }}
            style={styles.logo}
          />
          <Text style={styles.title}>WHO NO COME</Text>
          <Text style={styles.subtitle}>Fast Delivery at Your Fingertips</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {isLogin ? "Welcome Back" : "Create Account"}
          </Text>

          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "customer" && styles.roleButtonActive,
              ]}
              onPress={() => setRole("customer")}
            >
              <User 
                size={20} 
                color={role === "customer" ? Colors.background : Colors.text} 
              />
              <Text 
                style={[
                  styles.roleText,
                  role === "customer" && styles.roleTextActive,
                ]}
              >
                Customer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "driver" && styles.roleButtonActive,
              ]}
              onPress={() => setRole("driver")}
            >
              <Truck 
                size={20} 
                color={role === "driver" ? Colors.background : Colors.text} 
              />
              <Text 
                style={[
                  styles.roleText,
                  role === "driver" && styles.roleTextActive,
                ]}
              >
                Driver
              </Text>
            </TouchableOpacity>
          </View>

          {!isLogin && (
            <>
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                leftIcon={<User size={20} color={Colors.textLight} />}
                error={errors.name}
                autoCapitalize="words"
              />

              <Input
                label="Phone Number"
                placeholder="Enter your phone number"
                value={phone}
                onChangeText={setPhone}
                leftIcon={<Phone size={20} color={Colors.textLight} />}
                error={errors.phone}
                keyboardType="phone-pad"
              />
            </>
          )}

          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            leftIcon={<Mail size={20} color={Colors.textLight} />}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            leftIcon={<Lock size={20} color={Colors.textLight} />}
            error={errors.password}
            secureTextEntry
          />

          {errors.form && (
            <Text style={styles.formError}>{errors.form}</Text>
          )}

          <Button
            title={isLogin ? "Login" : "Sign Up"}
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
          />

          <TouchableOpacity
            onPress={toggleAuthMode}
            style={styles.toggleButton}
          >
            <Text style={styles.toggleText}>
              {isLogin
                ? "Don't have an account? Sign Up"
                : "Already have an account? Login"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Demo credentials */}
        {isLogin && (
          <View style={styles.demoContainer}>
            <Text style={styles.demoTitle}>Demo Credentials</Text>
            <Text style={styles.demoText}>
              Customer: alex@example.com
            </Text>
            <Text style={styles.demoText}>
              Driver: john@whnocome.com
            </Text>
            <Text style={styles.demoText}>
              Password: password123 (use any password)
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 24,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 24,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 24,
  },
  roleSelector: {
    flexDirection: "row",
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  roleButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
  },
  roleTextActive: {
    color: Colors.background,
  },
  submitButton: {
    marginTop: 16,
  },
  toggleButton: {
    marginTop: 24,
    alignItems: "center",
  },
  toggleText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  formError: {
    color: Colors.error,
    textAlign: "center",
    marginTop: 8,
  },
  demoContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.card,
    marginHorizontal: 24,
    borderRadius: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
});