declare module 'react-simple-maps' {
  import { ReactNode } from 'react'
  
  export interface ComposableMapProps {
    projection?: string
    projectionConfig?: any
    width?: number
    height?: number
    children?: ReactNode
  }
  
  export const ComposableMap: React.FC<ComposableMapProps>
  export const Geographies: React.FC<any>
  export const Geography: React.FC<any>
  export const Line: React.FC<any>
  export const Marker: React.FC<any>
}
