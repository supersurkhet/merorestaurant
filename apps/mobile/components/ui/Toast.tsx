import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useThemeColor } from '../../hooks/useThemeColor';

type ToastType = 'success' | 'error' | 'info';

interface ToastData {
  message: string;
  type: ToastType;
  id: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </ToastContext.Provider>
  );
}

function ToastItem({ toast }: { toast: ToastData }) {
  const colors = useThemeColor();
  const bgColor =
    toast.type === 'success'
      ? colors.success
      : toast.type === 'error'
        ? colors.error
        : colors.card;
  const textColor = toast.type === 'info' ? colors.text : '#fff';

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      exiting={FadeOutUp.duration(200)}
      style={[
        styles.toast,
        {
          backgroundColor: bgColor,
          borderColor: toast.type === 'info' ? colors.border : 'transparent',
          borderWidth: toast.type === 'info' ? 1 : 0,
        },
      ]}
    >
      <Text style={[styles.toastText, { color: textColor }]}>{toast.message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 9999,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
