"use client";

import { Provider } from "react-redux";
import { store } from "../store";
import type { JSX } from "react";
import React from "react";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps): JSX.Element {
  return <Provider store={store}>{children}</Provider>;
}
