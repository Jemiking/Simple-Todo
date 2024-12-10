import React, { memo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface DescriptionInputProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  error?: string;
  maxLength?: number;
}

const DescriptionInput: React.FC<DescriptionInputProps> = ({
  value,
  onChange,
  placeholder = '添加描述（可选）',
  error,
  maxLength = 500,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [height, setHeight] = useState(100);

  // 处理内容大小变化
  const handleContentSizeChange = useCallback((event) => {
    setHeight(Math.max(100, event.nativeEvent.contentSize.height));
  }, []);

  // 处理清除
  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedContainer,
          error && styles.errorContainer,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              height: Math.min(height, 200),
            },
          ]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#9e9e9e"
          multiline
          textAlignVertical="top"
          maxLength={maxLength}
          onContentSizeChange={handleContentSizeChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {value.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
          >
            <MaterialIcons name="close" size={20} color="#757575" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <Text style={styles.counter}>
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  focusedContainer: {
    borderColor: '#2196F3',
  },
  errorContainer: {
    borderColor: '#f44336',
  },
  input: {
    padding: 12,
    fontSize: 16,
    color: '#212121',
    minHeight: 100,
    maxHeight: 200,
  },
  clearButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  counter: {
    fontSize: 12,
    color: '#757575',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
  },
});

export default memo(DescriptionInput); 