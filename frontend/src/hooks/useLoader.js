import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// Ejecuta una carga asíncrona cada vez que cambia `key` y expone { data, error, loading }.
// `loading` es true mientras la última respuesta no corresponda a la key actual,
// así se muestran skeletons sin llamar setState de forma síncrona dentro del efecto.
export default function useLoader(load, key) {
  const loadRef = useRef(load);
  const [state, setState] = useState({ key: null, data: null, error: null });

  useLayoutEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(() => loadRef.current())
      .then((data) => {
        if (active) setState({ key, data, error: null });
      })
      .catch((error) => {
        if (active) setState({ key, data: null, error });
      });
    return () => {
      active = false;
    };
  }, [key]);

  const loading = state.key !== key;
  return { data: loading ? null : state.data, error: loading ? null : state.error, loading };
}
