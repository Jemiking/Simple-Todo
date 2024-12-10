import React, { memo, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  Text,
} from 'react-native';
import { TodoPriority, RepeatConfig } from '../types/todo';
import DatePicker from './DatePicker';
import PriorityPicker from './PriorityPicker';
import DescriptionInput from './DescriptionInput';
import RepeatPicker from './RepeatPicker';
import CategoryPicker from './CategoryPicker';
import TagPicker from './TagPicker';

interface CustomInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  dueDate?: Date;
  onDueDateChange?: (date: Date | undefined) => void;
  priority?: TodoPriority;
  onPriorityChange?: (priority: TodoPriority | undefined) => void;
  repeat?: RepeatConfig;
  onRepeatChange?: (repeat: RepeatConfig | undefined) => void;
  categoryId?: string;
  onCategoryChange?: (categoryId: string | undefined) => void;
  tagIds?: string[];
  onTagsChange?: (tagIds: string[]) => void;
  isDescription?: boolean;
  error?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({
  value,
  onChangeText,
  dueDate,
  onDueDateChange,
  priority,
  onPriorityChange,
  repeat,
  onRepeatChange,
  categoryId,
  onCategoryChange,
  tagIds,
  onTagsChange,
  isDescription,
  error,
  ...props
}) => {
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showRepeatPicker, setShowRepeatPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);

  if (onDueDateChange) {
    return (
      <DatePicker
        value={dueDate}
        onChange={onDueDateChange}
        error={error}
      />
    );
  }

  if (onPriorityChange) {
    return (
      <PriorityPicker
        value={priority}
        onChange={onPriorityChange}
        visible={showPriorityPicker}
        onClose={() => setShowPriorityPicker(false)}
        error={error}
      />
    );
  }

  if (onRepeatChange) {
    return (
      <RepeatPicker
        value={repeat}
        onChange={onRepeatChange}
        visible={showRepeatPicker}
        onClose={() => setShowRepeatPicker(false)}
        error={error}
      />
    );
  }

  if (onCategoryChange) {
    return (
      <CategoryPicker
        value={categoryId}
        onChange={onCategoryChange}
        visible={showCategoryPicker}
        onClose={() => setShowCategoryPicker(false)}
        error={error}
      />
    );
  }

  if (onTagsChange) {
    return (
      <TagPicker
        value={tagIds}
        onChange={onTagsChange}
        visible={showTagPicker}
        onClose={() => setShowTagPicker(false)}
        error={error}
      />
    );
  }

  if (isDescription) {
    return (
      <DescriptionInput
        value={value}
        onChange={onChangeText}
        error={error}
      />
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          props.multiline && styles.multilineInput,
          error && styles.errorInput,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#9e9e9e"
        {...props}
      />
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    fontSize: 16,
    color: '#212121',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorInput: {
    borderColor: '#f44336',
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
    fontSize: 12,
    color: '#f44336',
  },
});

export default memo(CustomInput); 