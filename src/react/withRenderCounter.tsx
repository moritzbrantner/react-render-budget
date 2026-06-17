import { createElement, type Attributes, type ComponentType } from "react";

import { incrementComponentRenderCount } from "../core/globals";

export function withRenderCounter<Props extends object>(
  Component: ComponentType<Props>,
  name: string,
): ComponentType<Props> {
  function WithRenderCounter(props: Props) {
    incrementComponentRenderCount(name);

    return createElement(Component, props as Attributes & Props);
  }

  WithRenderCounter.displayName = `withRenderCounter(${
    Component.displayName ?? Component.name ?? name
  })`;

  return WithRenderCounter;
}
