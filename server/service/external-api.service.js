class ExternalApiService {
    constructor() {
        this.apiBaseUrl = 'https://jsonplaceholder.typicode.com';
        this.timeout = 5000;
    }

    async makeRequest(endpoint, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new Error('Запрос к внешнему API превысил время ожидания');
            }

            throw new Error(`Ошибка внешнего API: ${error.message}`);
        }
    }

    async calculateShipping({orderId, totalAmount}) {
        try {
            console.log(`Запрос расчета доставки для заказа ${orderId}, сумма: ${totalAmount}`);

            const response = await this.makeRequest('/posts/1');

            const baseShippingCost = totalAmount > 1000 ? 0 : 200;
            const estimatedDays = Math.floor(Math.random() * 5) + 1;

            const result = {
                shippingCost: baseShippingCost,
                estimatedDelivery: new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000),
                trackingNumber: this.generateTrackingNumber(),
                courier: this.getRandomCourier()
            };

            console.log('Результат расчета доставки:', result);
            return result;

        } catch (error) {
            console.error('Ошибка расчета доставки:', error.message);
            throw error;
        }
    }

    async getExchangeRates() {
        try {
            const response = await this.makeRequest('/users/1');

            const rates = {
                USD: 75.5 + Math.random() * 5,
                EUR: 85.2 + Math.random() * 5,
                KZT: 1,
                updatedAt: new Date().toISOString()
            };

            console.log('Актуальные курсы валют:', rates);
            return rates;

        } catch (error) {
            console.error('Ошибка получения курсов валют:', error.message);

            return {
                USD: 78.0,
                EUR: 87.5,
                KZT: 1,
                updatedAt: new Date().toISOString(),
                cached: true
            };
        }
    }

    async checkDeliveryStatus(trackingNumber) {
        try {
            console.log(`Проверка статуса доставки: ${trackingNumber}`);

            const response = await this.makeRequest(`/posts/${Math.floor(Math.random() * 100) + 1}`);

            const statuses = [
                'В пути к покупателю',
                'Прибыл в город назначения',
                'Готов к выдаче',
                'Доставлен'
            ];

            const result = {
                trackingNumber,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                location: 'Алматы, сортировочный центр',
                lastUpdate: new Date(),
                estimatedDelivery: new Date(Date.now() + Math.random() * 3 * 24 * 60 * 60 * 1000)
            };

            console.log('Статус доставки:', result);
            return result;

        } catch (error) {
            console.error('Ошибка проверки статуса доставки:', error.message);
            throw error;
        }
    }

    async validateAddress(address) {
        try {
            console.log('Валидация адреса:', address);

            const response = await this.makeRequest('/users/1');

            const isValid = address.city && address.street && address.building;

            const result = {
                valid: isValid,
                normalized: isValid ? {
                    ...address,
                    city: address.city.trim(),
                    street: address.street.trim(),
                    building: address.building.trim(),
                    coordinates: {
                        lat: 43.2220 + Math.random() * 0.1,
                        lng: 76.8512 + Math.random() * 0.1
                    }
                } : null,
                suggestions: isValid ? [] : [
                    'Укажите город',
                    'Укажите улицу',
                    'Укажите номер дома'
                ].filter((_, i) => !Object.values(address)[i])
            };

            console.log('Результат валидации адреса:', result);
            return result;

        } catch (error) {
            console.error('Ошибка валидации адреса:', error.message);
            throw error;
        }
    }

    async getProductInfo(externalId) {
        try {
            const response = await this.makeRequest(`/posts/${externalId}`);

            return {
                externalId,
                title: response.title,
                description: response.body,
                category: 'general',
                lastUpdated: new Date()
            };

        } catch (error) {
            console.error('Ошибка получения информации о товаре:', error.message);
            throw error;
        }
    }

    generateTrackingNumber() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 10; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    getRandomCourier() {
        const couriers = ['Казпочта', 'СДЭК', 'Boxberry', 'DHL Express'];
        return couriers[Math.floor(Math.random() * couriers.length)];
    }

    async healthCheck() {
        try {
            const start = Date.now();
            await this.makeRequest('/posts/1');
            const responseTime = Date.now() - start;

            return {
                status: 'healthy',
                responseTime: `${responseTime}ms`,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

export default new ExternalApiService();