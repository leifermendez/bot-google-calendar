import OpenAI from "openai";
import fs from "fs";
import { ChatCompletionMessageParam } from "openai/resources/chat";


class AIClass {
    private openai: OpenAI;
    private model: string

    constructor(apiKey: string, _model: string) {
        this.openai = new OpenAI({ apiKey, timeout: 15 * 1000 });
        if (!apiKey || apiKey.length === 0) {
            throw new Error("OPENAI_KEY is missing");
        }

        this.model = _model
    }

    /**
     * 
     * @param path 
     * @returns 
     */
    voiceToText = async (path: fs.PathLike) => {
        if (!fs.existsSync(path)) {
            throw new Error("No se encuentra el archivo");
        }
    
        try {
            const transcription = await this.openai.audio.transcriptions.create({
                file: fs.createReadStream(path),
                model: "whisper-1"
            })
    
            return transcription.text;
        } catch (err) {
            console.log(err.response.data)
            return "ERROR";
        }
    };

    /**
     * 
     * @param messages 
     * @param model 
     * @param temperature 
     * @returns 
     */
    createChat = async (
        messages: ChatCompletionMessageParam[],
        model?: string,
        temperature = 0
    ) => {
        try {
            const completion = await this.openai.chat.completions.create({
                model: model ?? this.model,
                messages,
                temperature,
                max_tokens: 256,
                top_p: 0,
                frequency_penalty: 0,
                presence_penalty: 0,
            });

            return completion.choices[0].message.content;
        } catch (err) {
            console.error(err);
            return "ERROR";
        }
    };


    /**
     * experimental 🟠
     * @param messages 
     * @param model 
     * @param temperature 
     * @returns 
     */
    determineChatFn = async (
        messages: ChatCompletionMessageParam[],
        model?: string,
        temperature = 0
    ): Promise<{ prediction: string }> => {
        try {
            const completion = await this.openai.chat.completions.create({
                model,
                temperature: temperature,
                messages,
                functions: [
                    {
                        name: "fn_get_prediction_intent",
                        description: "Predict the user intention for a given conversation",
                        parameters: {
                            type: "object",
                            properties: {
                                prediction: {
                                    type: "string",
                                    description: "The predicted user intention.",
                                    items: {
                                        type: "string",
                                        enum: [
                                            "PROGRAMAR",
                                            "HABLAR",
                                        ]
                                    },
                                },

                            },
                            required: ["prediction"]
                        }
                    }
                ],
                function_call: {
                    name: "fn_get_prediction_intent",
                }
            });
            // Convert json to object
            const response = JSON.parse(completion.choices[0].message.function_call.arguments);

            return response;
        } catch (err) {
            console.error(err);
            return {
                prediction: '',
            }
        }
    };

    /**
     * experimental 🟠
     * @param messages 
     * @param model 
     * @param temperature 
     * @returns 
     */
    bookChatFn = async (
        messages: ChatCompletionMessageParam[],
        model?: string,
        temperature = 0
    ): Promise<{ available?: boolean, confirm: boolean, bookDate: string, bestAnswer: string }> => {
        try {
            const completion = await this.openai.chat.completions.create({
                model: model ?? this.model,
                temperature: temperature,
                messages,
                functions: [
                    {
                        name: "fn_get_book_available",
                        description: "to obtain the best response for the customer based on the requested date and its availability",
                        parameters: {
                            type: "object",
                            properties: {
                                available: {
                                    type: "boolean",
                                    description: "based on Reserved space you must calculate and tell me if it is possible to schedule based on the date and time that the customer wants",
                                },
                                bookDate: {
                                    type: "string",
                                    description: "tentative date and time of booking in YYYYY/MM/DD hh:mm format",
                                },
                                confirm: {
                                    type: "boolean",
                                    description: "the seller and the customer confirmed by both parties the appropriate time and date yes or no",
                                },
                                bestAnswer: {
                                    type: "string",
                                    description: "seller answer"
                                },

                            },
                            required: ["bestAnswer", "confirm", "bookDate"]
                        }
                    }
                ],
                function_call: {
                    name: "fn_get_book_available",
                }
            });
            // Convert json to object
            const response = JSON.parse(completion.choices[0].message.function_call.arguments);

            return response;
        } catch (err) {
            console.error(err);
            return {
                bestAnswer: '',
                bookDate: '',
                available: false,
                confirm: false,
            }
        }
    };

    checkConflict = async (
        messages: ChatCompletionMessageParam[],
        model?: string,
        temperature = 0
    ): Promise<{ hasNoConflict: boolean, sellerAnswer: string }> => {
        try {
            const completion = await this.openai.chat.completions.create({
                model: model ?? this.model,
                temperature: temperature,
                messages,
                functions: [
                    {
                        name: "fn_check_if_exits_conflict",
                        description: "determine whether there is a conflict with previous reservations on the list",
                        parameters: {
                            type: "object",
                            properties: {
                                hasNoConflict: {
                                    type: "boolean",
                                    description: "is a boolean value indicating if there is no conflict between the date the customer wants and the existing pre-bookings taking into account the last date the customer wants.",
                                },
                                sellerAnswer: {
                                    type: "string",
                                    description: "seller answer"
                                },

                            },
                            required: ["hasNoConflict", "sellerAnswer"]
                        }
                    }
                ],
                function_call: {
                    name: "fn_check_if_exits_conflict",
                }
            });
            // Convert json to object
            const response = JSON.parse(completion.choices[0].message.function_call.arguments);

            return response;
        } catch (err) {
            console.error(err);
            return {
                sellerAnswer: 'ERROR',
                hasNoConflict: false,
            }
        }
    };

    /**
     * 
     * @param messages 
     * @param model 
     * @param temperature 
     * @returns 
     */
    desiredDateFn = async (
        messages: ChatCompletionMessageParam[],
        model?: string,
        temperature = 0
    ): Promise<{ date: string }> => {
        try {
            const completion = await this.openai.chat.completions.create({
                model: model ?? this.model,
                temperature: temperature,
                messages,
                functions: [
                    {
                        name: "fn_desired_date",
                        description: "determine the user's desired date in the format  yyyy/MM/dd HH:mm:ss",
                        parameters: {
                            type: "object",
                            properties: {
                                date: {
                                    type: "string",
                                    description: "yyyy/MM/dd HH:mm:ss.",
                                }

                            },
                            required: ["date"]
                        }
                    }
                ],
                function_call: {
                    name: "fn_desired_date",
                }
            });
            // Convert json to object
            const response = JSON.parse(completion.choices[0].message.function_call.arguments);

            return response;
        } catch (err) {
            console.error(err);
            return {
                date: '',
            }
        }
    };

}

export default AIClass;
