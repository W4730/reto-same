import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollViewInstance } from 'react-native';

/** Lo único que necesitamos del campo enfocado: e.target en Fabric es un elemento nativo con measureInWindow. */
type Measurable = { measureInWindow(cb: (x: number, y: number, w: number, h: number) => void): void };

/**
 * Al enfocar un campo, lo desplaza al centro del espacio que queda visible sobre el teclado.
 * Uso: <ScrollView {...kb.scroll}> … <View style={{ height: kb.pad }} /></ScrollView> y <TextInput {...kb.field()} />.
 * ponytail: mide en coordenadas de ventana; si algún día va dentro de un modal con offset, revisar.
 */
export function useKeyboardCenter() {
  const scroll = useRef<ScrollViewInstance>(null);
  const offset = useRef(0);
  const kbHeight = useRef(0);
  const focused = useRef<Measurable | null>(null);
  const [pad, setPad] = useState(0);
  const [viewH, setViewH] = useState(0);

  const center = useCallback((input: Measurable | null) => {
    if (!input || !kbHeight.current) return;
    input.measureInWindow((_x, y, _w, h) => {
      const visible = Dimensions.get('window').height - kbHeight.current;
      const delta = y + h / 2 - visible / 2;
      scroll.current?.scrollTo({ y: Math.max(0, offset.current + delta), animated: true });
    });
  }, []);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      kbHeight.current = e.endCoordinates.height;
      // Espacio extra: alto del teclado + media pantalla visible, para que hasta el último campo llegue al centro.
      setPad(e.endCoordinates.height + (Dimensions.get('window').height - e.endCoordinates.height) / 2);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      kbHeight.current = 0;
      setPad(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [center]);

  // Centrar recién cuando el espaciador ya está dibujado; si no, el scroll se recorta.
  useEffect(() => {
    if (pad) requestAnimationFrame(() => center(focused.current));
  }, [pad, center]);

  return {
    pad,
    /** Alto visible del ScrollView: úsalo como minHeight del contenido centrado, así el espaciador
     *  del teclado queda fuera de la pantalla y de verdad agrega recorrido (con flexGrow se absorbía). */
    viewH,
    scroll: {
      ref: scroll,
      onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        offset.current = e.nativeEvent.contentOffset.y;
      },
      scrollEventThrottle: 16,
      keyboardShouldPersistTaps: 'handled' as const,
      onLayout: (e: { nativeEvent: { layout: { height: number } } }) => setViewH(e.nativeEvent.layout.height),
    },
    /** Props para cada TextInput: recuerda cuál está enfocado y lo centra (también al cambiar de campo con el teclado abierto). */
    field: () => ({
      onFocus: (e: { target: unknown }) => {
        focused.current = e.target as Measurable;
        center(focused.current);
      },
    }),
  };
}
