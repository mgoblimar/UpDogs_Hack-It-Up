import { Text as RNText, TextInput as RNTextInput, TextProps as RNTextProps, TextInputProps as RNTextInputProps, StyleSheet } from 'react-native'

export interface CustomTextProps extends RNTextProps {}

/**
 * A wrapper around React Native's Text component that applies the Quicksand font by default.
 * It reads the `fontWeight` from the style prop (if provided) to select the correct Quicksand font family weight.
 */
export function Text(props: CustomTextProps) {
  const { style, ...rest } = props

  // Extract the flat style object
  const flatStyle = StyleSheet.flatten(style) || {}
  
  // Default to 400 (Regular) if no weight is specified
  const weight = flatStyle.fontWeight || '400'
  
  let fontFamily = 'Quicksand_400Regular'

  switch (weight) {
    case '300':
      fontFamily = 'Quicksand_300Light'
      break
    case 'normal':
    case '400':
      fontFamily = 'Quicksand_400Regular'
      break
    case '500':
      fontFamily = 'Quicksand_500Medium'
      break
    case '600':
      fontFamily = 'Quicksand_600SemiBold'
      break
    case 'bold':
    case '700':
    case '800':
    case '900':
      // Quicksand maxes out at 700 bold, so map 800/900 to 700
      fontFamily = 'Quicksand_700Bold'
      break
  }

  // We remove fontWeight from the style because we are mapping it directly to a specific font family file.
  // Setting both fontFamily and fontWeight on Android can cause it to fallback to the system font.
  const { fontWeight, ...styleWithoutWeight } = flatStyle as any

  return (
    <RNText
      {...rest}
      style={[styleWithoutWeight, { fontFamily }]}
    />
  )
}

export interface CustomTextInputProps extends RNTextInputProps {}

/**
 * A wrapper around React Native's TextInput component that applies the Quicksand font by default.
 */
export function TextInput(props: CustomTextInputProps) {
  const { style, ...rest } = props

  const flatStyle = StyleSheet.flatten(style) || {}
  const weight = flatStyle.fontWeight || '400'
  
  let fontFamily = 'Quicksand_400Regular'

  switch (weight) {
    case '300':
      fontFamily = 'Quicksand_300Light'
      break
    case 'normal':
    case '400':
      fontFamily = 'Quicksand_400Regular'
      break
    case '500':
      fontFamily = 'Quicksand_500Medium'
      break
    case '600':
      fontFamily = 'Quicksand_600SemiBold'
      break
    case 'bold':
    case '700':
    case '800':
    case '900':
      fontFamily = 'Quicksand_700Bold'
      break
  }

  const { fontWeight, ...styleWithoutWeight } = flatStyle as any

  return (
    <RNTextInput
      {...rest}
      style={[styleWithoutWeight, { fontFamily }]}
    />
  )
}
