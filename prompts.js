const { spinner, select, text } = require("@clack/prompts");

/**
 *
 * @param {{key: string; msg: string; default?: string; placeholder?: string; required?: boolean; type: 'text' | 'select'; options?: {label: string; value: string}[]; validate?: (_) => string | void; transform?: (_) => any}[]} config
 */
async function runPrompt(config) {
    const result = {};
    for (const promptItem of config) {
        switch (promptItem.type) {
            case 'select':
                result[promptItem.key] = await select({
                    message: promptItem.msg,
                    required: promptItem.required ?? false,
                    options: promptItem.options ?? [],
                    default: promptItem.default
                });
                break;
            case 'text':
                result[promptItem.key] = await text({
                    message: promptItem.msg,
                    placeholder: promptItem.placeholder,
                    required: promptItem.required ?? false,
                    validate: promptItem.validate,
                    default: promptItem.default
                });
                if (promptItem.transform) {
                    result[promptItem.key] = promptItem.transform(result[promptItem.key]);
                }
                break;
            default:
                break;
        }
    }
    return result;
}

async function promptSpinner(msg) {
    const spinnerRef = spinner();
    spinnerRef.start(msg);
    return spinnerRef;
}

module.exports = {
    promptSpinner,
    runPrompt
}