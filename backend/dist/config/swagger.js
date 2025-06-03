"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerUi = exports.specs = void 0;
// Conditional swagger setup - only load packages when needed
let swaggerJsdoc = null;
let swaggerUi = null;
exports.swaggerUi = swaggerUi;
let specs = null;
exports.specs = specs;
// Check if swagger should be enabled
const shouldEnableSwagger = process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true';
if (shouldEnableSwagger) {
    try {
        swaggerJsdoc = require('swagger-jsdoc');
        exports.swaggerUi = swaggerUi = require('swagger-ui-express');
        const options = {
            definition: {
                openapi: '3.0.0',
                info: {
                    title: 'Fusion AI API Documentation',
                    version: '1.0.0',
                    description: 'Comprehensive API documentation for the Fusion AI platform - a unified AI orchestration system with NeuroSwitch™ technology',
                    contact: {
                        name: 'Fusion AI Support',
                        email: 'support@fusionai.com'
                    },
                    license: {
                        name: 'Private',
                        url: 'https://fusionai.com/license'
                    }
                },
                servers: [
                    {
                        url: process.env.BACKEND_URL || 'http://localhost:5000',
                        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
                    }
                ],
                components: {
                    securitySchemes: {
                        bearerAuth: {
                            type: 'http',
                            scheme: 'bearer',
                            bearerFormat: 'JWT',
                            description: 'JWT token obtained from login or API key with sk-fusion- prefix'
                        }
                    },
                    schemas: {
                        Error: {
                            type: 'object',
                            properties: {
                                error: {
                                    type: 'string',
                                    description: 'Error message'
                                },
                                details: {
                                    type: 'string',
                                    description: 'Additional error details'
                                }
                            },
                            required: ['error']
                        },
                        ApiKey: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'integer',
                                    description: 'Unique identifier for the API key'
                                },
                                name: {
                                    type: 'string',
                                    description: 'Human-readable name for the API key'
                                },
                                api_key: {
                                    type: 'string',
                                    description: 'The actual API key (only shown on creation)'
                                },
                                api_key_masked: {
                                    type: 'string',
                                    description: 'Masked version of the API key for display'
                                },
                                created_at: {
                                    type: 'string',
                                    format: 'date-time',
                                    description: 'Creation timestamp'
                                },
                                last_used_at: {
                                    type: 'string',
                                    format: 'date-time',
                                    nullable: true,
                                    description: 'Last usage timestamp'
                                },
                                is_active: {
                                    type: 'boolean',
                                    description: 'Whether the API key is active'
                                }
                            }
                        },
                        ExternalApiKey: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'integer',
                                    description: 'Unique identifier for the external API key'
                                },
                                provider_id: {
                                    type: 'integer',
                                    description: 'ID of the AI provider'
                                },
                                provider_name: {
                                    type: 'string',
                                    description: 'Name of the AI provider (OpenAI, Claude, Gemini)'
                                },
                                key_name: {
                                    type: 'string',
                                    description: 'User-defined name for the key'
                                },
                                key_preview: {
                                    type: 'string',
                                    description: 'Masked preview of the API key'
                                },
                                is_active: {
                                    type: 'boolean',
                                    description: 'Whether the key is active'
                                },
                                created_at: {
                                    type: 'string',
                                    format: 'date-time'
                                },
                                updated_at: {
                                    type: 'string',
                                    format: 'date-time'
                                }
                            }
                        },
                        ChatRequest: {
                            type: 'object',
                            properties: {
                                prompt: {
                                    type: 'string',
                                    description: 'The user message/prompt'
                                },
                                provider: {
                                    type: 'string',
                                    description: 'Target AI provider (neuroswitch, openai, claude, gemini)',
                                    enum: ['neuroswitch', 'openai', 'claude', 'gemini']
                                },
                                model: {
                                    type: 'string',
                                    description: 'Specific model to use (optional)'
                                },
                                image: {
                                    type: 'string',
                                    description: 'Base64 encoded image for vision models (optional)'
                                },
                                mode: {
                                    type: 'string',
                                    description: 'Chat mode (optional)'
                                }
                            },
                            required: ['prompt']
                        },
                        ChatResponse: {
                            type: 'object',
                            properties: {
                                prompt: {
                                    type: 'string',
                                    description: 'The original prompt'
                                },
                                response: {
                                    type: 'object',
                                    properties: {
                                        text: {
                                            type: 'string',
                                            description: 'The AI response text'
                                        }
                                    }
                                },
                                provider: {
                                    type: 'string',
                                    description: 'Actual provider used'
                                },
                                model: {
                                    type: 'string',
                                    description: 'Actual model used'
                                },
                                tokens: {
                                    type: 'object',
                                    properties: {
                                        total_tokens: {
                                            type: 'integer'
                                        },
                                        input_tokens: {
                                            type: 'integer'
                                        },
                                        output_tokens: {
                                            type: 'integer'
                                        }
                                    }
                                },
                                timestamp: {
                                    type: 'string',
                                    format: 'date-time'
                                }
                            }
                        },
                        User: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'integer'
                                },
                                email: {
                                    type: 'string',
                                    format: 'email'
                                },
                                display_name: {
                                    type: 'string'
                                },
                                role: {
                                    type: 'string',
                                    enum: ['user', 'admin', 'tester']
                                },
                                is_verified: {
                                    type: 'boolean'
                                },
                                created_at: {
                                    type: 'string',
                                    format: 'date-time'
                                }
                            }
                        }
                    }
                },
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                tags: [
                    {
                        name: 'Authentication',
                        description: 'User authentication and registration'
                    },
                    {
                        name: 'API Keys',
                        description: 'Internal platform API key management'
                    },
                    {
                        name: 'External API Keys',
                        description: 'BYOAPI - User-provided AI provider keys'
                    },
                    {
                        name: 'Chat',
                        description: 'AI chat interactions and NeuroSwitch routing'
                    },
                    {
                        name: 'Models',
                        description: 'Available AI models and providers'
                    },
                    {
                        name: 'User Profile',
                        description: 'User account and profile management'
                    },
                    {
                        name: 'Credits',
                        description: 'Credit balance and transactions'
                    },
                    {
                        name: 'Chat History',
                        description: 'Chat conversation management'
                    }
                ]
            },
            apis: [
                './src/routes/*.ts',
                './src/server.ts'
            ],
        };
        exports.specs = specs = swaggerJsdoc(options);
        console.log('✅ Swagger documentation initialized successfully');
    }
    catch (error) {
        console.error('❌ Swagger setup failed:', error);
        console.log('Swagger documentation will not be available');
    }
}
else {
    console.log('📚 Swagger documentation disabled in production mode');
}
