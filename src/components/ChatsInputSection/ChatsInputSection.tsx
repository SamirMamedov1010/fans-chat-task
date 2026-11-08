import { StyleSheet, View, type TextInputProps } from 'react-native';

import { CustomInput } from '@/components/CustomInput';
import { IconButton } from '@/components/IconButton';
import { SearchIcon, SidebarIcon } from '@/components/icons';
import { colors } from '@/theme';

export type ChatsInputSectionProps = Pick<
  TextInputProps,
  'onChangeText' | 'onSubmitEditing' | 'value'
> & {
  onSidebarPress?: () => void;
  placeholder?: string;
};

export function ChatsInputSection({
  onChangeText,
  onSidebarPress,
  onSubmitEditing,
  placeholder = 'Search for conversations',
  value,
}: ChatsInputSectionProps) {
  return (
    <View style={styles.container}>
      <CustomInput
        accessibilityLabel={placeholder}
        containerStyle={styles.input}
        inputMode="search"
        leftIcon={SearchIcon}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        placeholder={placeholder}
        returnKeyType="search"
        value={value}
      />

      <IconButton
        accessibilityLabel="Open chat filters"
        icon={SidebarIcon}
        onPress={onSidebarPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
  },
});
