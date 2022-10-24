import { ParentContext } from '../../context/ParentContextProvider'

export const assertBoxParentContext = (parentContext?: ParentContext['box']): true => {
  if (!parentContext?.boxProfileUuid) {
    throw new Error('API fetch requires parent context to be defined')
  }

  return true
}
