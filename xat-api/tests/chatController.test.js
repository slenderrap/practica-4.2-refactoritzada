const { generateResponse } = require('../../src/controllers/chatController');
const axios = require('axios');
const { logger } = require('../../src/config/logger');

// Mock del mòdul axios
jest.mock('axios');

// Mock del mòdul logger per silenciar els logs durant els tests
jest.mock('../../src/config/logger', () => ({
    logger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    }
}));

describe('generateResponse', () => {
    const prompt = 'Hola, com estàs?';
    const model = 'llama3.2-vision:latest';
    const apiUrl = process.env.CHAT_API_OLLAMA_URL;

    afterEach(() => {
        jest.clearAllMocks(); // Netejar els mocks després de cada test
    });

    it('Hauria de retornar una resposta d\'Ollama correctament', async () => {
        // Configurar el mock d'axios per a un cas d'èxit
        const mockResponse = { data: { response: 'Estic bé, gràcies!' } };
        axios.post.mockResolvedValue(mockResponse);

        const response = await generateResponse(prompt, { model });
        expect(response).toBe('Estic bé, gràcies!');
        expect(axios.post).toHaveBeenCalledWith(`${apiUrl}/generate`, {
            model: model,
            prompt: prompt,
            stream: false
        }, { timeout: 30000, responseType: 'json' });
    });

    it('Hauria de gestionar un error d\'axios i retornar un missatge d\'error', async () => {
        // Configurar el mock d'axios per simular un error
        axios.post.mockRejectedValue(new Error('Error de connexió a Ollama'));

        const response = await generateResponse(prompt, { model });
        expect(response).toBe('Ho sento, no he pogut generar una resposta en aquest moment.');
        expect(logger.error).toHaveBeenCalled();
    });

    it('Hauria de gestionar una resposta d\'error d\'Ollama amb detalls', async () => {
        // Configurar el mock d'axios per simular una resposta d'error d'Ollama
        const mockErrorResponse = {
            response: {
                status: 500,
                data: { message: 'Error intern d\'Ollama' }
            }
        };
        axios.post.mockRejectedValue(mockErrorResponse);

        const response = await generateResponse(prompt, { model });
        expect(response).toBe('Ho sento, no he pogut generar una resposta en aquest moment.');
        expect(logger.error).toHaveBeenCalled();
    });

    it('Hauria de gestionar correctament si la resposta no conté el camp "response"', async () => {
        // Configurar el mock d'axios per simular una resposta sense el camp "response"
        const mockResponse = { data: {} };
        axios.post.mockResolvedValue(mockResponse);

        const response = await generateResponse(prompt, { model });
        expect(response).toBe('Ho sento, no he pogut generar una resposta en aquest moment.');
        expect(logger.error).toHaveBeenCalled();
    });
    
    it('Hauria d\'utilitzar el model per defecte si no es proporciona un model', async () => {
        const mockResponse = { data: { response: 'Resposta amb model per defecte' } };
        axios.post.mockResolvedValue(mockResponse);
        const defaultModel = process.env.CHAT_API_OLLAMA_MODEL;

        await generateResponse(prompt);
        expect(axios.post).toHaveBeenCalledWith(
            `${apiUrl}/generate`,
            expect.objectContaining({ model: defaultModel }), 
            expect.anything()
        );
    });

});