import type {
  ReactNodeList
} from 'shared/ReactTypes';
import type {
  FiberRoot,
  Batch as FiberRootBatch,
} from 'react-reconciler/src/ReactFiberRoot';
import type {
  Container
} from './ReactDOMHostConfig';

import '../shared/checkReact';
import './ReactDOMClientInjection';

import {
  computeUniqueAsyncExpiration,
  findHostInstanceWithNoPortals,
  updateContainerAtExpirationTime,
  flushRoot,
  createContainer,
  updateContainer,
  batchedUpdates,
  unbatchedUpdates,
  interactiveUpdates,
  flushInteractiveUpdates,
  flushSync,
  flushControlled,
  injectIntoDevTools,
  getPublicRootInstance,
  findHostInstance,
  findHostInstanceWithWarning,
} from 'react-reconciler/inline.dom';

import {
  createPortal as createPortalImpl
} from 'shared/ReactPortal';
import {
  canUseDOM
} from 'shared/ExecutionEnvironment';
import {
  setBatchingImplementation
} from 'events/ReactGenericBatching';
import {
  setRestoreImplementation,
  enqueueStateRestore,
  restoreStateIfNeeded,
} from 'events/ReactControlledComponent';
import {
  injection as EventPluginHubInjection,
  runEventsInBatch,
} from 'events/EventPluginHub';
import {
  eventNameDispatchConfigs
} from 'events/EventPluginRegistry';
import {
  accumulateTwoPhaseDispatches,
  accumulateDirectDispatches,
} from 'events/EventPropagators';
import {
  has as hasInstance
} from 'shared/ReactInstanceMap';
import ReactVersion from 'shared/ReactVersion';
import ReactSharedInternals from 'shared/ReactSharedInternals';
import getComponentName from 'shared/getComponentName';
import invariant from 'shared/invariant';
import lowPriorityWarning from 'shared/lowPriorityWarning';
import warningWithoutStack from 'shared/warningWithoutStack';
import {
  enableStableConcurrentModeAPIs
} from 'shared/ReactFeatureFlags';

import {
  getInstanceFromNode,
  getNodeFromInstance,
  getFiberCurrentPropsFromNode,
  getClosestInstanceFromNode,
} from './ReactDOMComponentTree';
import {
  restoreControlledState
} from './ReactDOMComponent';
import {
  dispatchEvent
} from '../events/ReactDOMEventListener';
import {
  ELEMENT_NODE,
  COMMENT_NODE,
  DOCUMENT_NODE,
  DOCUMENT_FRAGMENT_NODE,
} from '../shared/HTMLNodeType';
import {
  ROOT_ATTRIBUTE_NAME
} from '../shared/DOMProperty';

// ???
const ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;

let topLevelUpdateWarnings;
let warnOnInvalidCallback;
let didWarnAboutUnstableCreatePortal = false;

// ???
setRestoreImplementation(restoreControlledState);