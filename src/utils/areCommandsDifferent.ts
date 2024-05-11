export default (existingCommand: any, localCommand: any): boolean => {
  const areChoicesDifferent = (existingChoices: any, localChoices: any): boolean => {
    for (const localChoice of localChoices) {
      const existingChoice = existingChoices?.find((choice: any) => choice.name === localChoice.name);

      if (!existingChoice) {
        return true;
      }

      if (localChoice.value !== existingChoice.value) {
        return true;
      }
    }
    return false;
  }

  const areOptionsDifferent = (existingOptions: any, localOptions: any): boolean => {
    for (const localOption of localOptions) {
      const existingOption = existingOptions?.find(
        (option: any) => option.name === localOption.name
      );

      if (!existingOption) {
        return true;
      }

      if (
        localOption.description !== existingOption.description ||
        localOption.type !== existingOption.type ||
        (localOption.required || false) !== existingOption.required ||
        (localOption.choices?.length || 0) !==
        (existingOption.choices?.length || 0) ||
        areChoicesDifferent(
          localOption.choices || [],
          existingOption.choices || []
        )
      ) {
        return true;
      }
    }
    return false;
  }

  if (
    existingCommand.description !== localCommand.data.description ||
    existingCommand.options?.length !== (localCommand.data.options?.length || 0) ||
    areOptionsDifferent(existingCommand.options, localCommand.data.options || [])
  ) {
    return true;
  }

  return false;
};