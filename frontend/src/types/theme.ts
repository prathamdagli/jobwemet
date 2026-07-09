export interface ColorScale {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
}

export interface ThemeColors {
  primary: ColorScale
  secondary: ColorScale
  success: ColorScale
  warning: ColorScale
  danger: ColorScale
  neutral: ColorScale
  background: string
  surface: string
  border: string
  foreground: string
  muted: string
  card: string
}

export interface ThemeRadius {
  sm: string
  md: string
  lg: string
  xl: string
  full: string
}

export interface ThemeShadow {
  sm: string
  md: string
  lg: string
}

export interface ThemeSpacing {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

export interface ThemeTransition {
  fast: string
  base: string
  slow: string
}

export interface ThemeZIndex {
  base: number
  dropdown: number
  sticky: number
  overlay: number
  modal: number
  toast: number
}

export interface ThemeBreakpoints {
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

export interface ThemeTypography {
  fontFamily: {
    sans: string
    mono: string
  }
  fontSize: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
  }
}

export interface Theme {
  colors: ThemeColors
  radius: ThemeRadius
  shadow: ThemeShadow
  spacing: ThemeSpacing
  transition: ThemeTransition
  zIndex: ThemeZIndex
  breakpoints: ThemeBreakpoints
  typography: ThemeTypography
}
