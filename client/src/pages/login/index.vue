<script setup lang="ts">
import {reactive, ref} from "vue";
import {useToast, InputText, Password, Button, Card, Message} from "primevue";
import {Form} from "@primevue/forms";
import {http} from "../../api/http.ts";
import {useRouter} from "vue-router";
import {useUserStore} from "../../store/user.ts";

interface IValues {
  email: string;
  password: string;
}

interface IErrors {
  email?: string;
  password?: string;
}

const router = useRouter();
const {setUserData} = useUserStore()
const formData = reactive<IValues>({
  email: "",
  password: ""
});

const errors = reactive<IErrors>({});
const toast = useToast();
const isLoading = ref(false);
const formRef = ref();

const initialValues = reactive<IValues>({
  email: "",
  password: ""
});

const resolver = ({values}: { values: IValues }) => {
  Object.assign(formData, values);

  Object.keys(errors).forEach(key => delete errors[key as keyof IErrors]);


  if (!formData.email.trim()) {
    errors.email = 'Email обязателен';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Введите корректный email адрес';
    }
  }

  if (!formData.password) {
    errors.password = 'Пароль обязателен';
  } else if (formData.password.length < 6) {
    errors.password = 'Пароль должен содержать минимум 6 символов';
  }

  const primeVueErrors: any = {};
  Object.keys(errors).forEach(key => {
    if (errors[key as keyof IErrors]) {
      primeVueErrors[key] = [{message: errors[key as keyof IErrors]}];
    }
  });

  return {
    values: formData,
    errors: primeVueErrors
  };
};

const validateField = (field: keyof IErrors) => {
  if (field === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email.trim() && emailRegex.test(formData.email)) {
      delete errors.email;
    }
  } else if (field === 'password') {
    if (formData.password && formData.password.length >= 6) {
      delete errors.password;
    }
  }
};
const isFormValid = (): boolean => {
  return !errors.email && !errors.password &&
      formData.email.trim() !== '' &&
      formData.password !== '';
};

const onSubmit = async ({values, valid}: { values: IValues; valid: boolean }) => {
  if (!valid || !isFormValid()) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка валидации',
      detail: 'Пожалуйста, исправьте ошибки в форме',
      life: 3000
    });
    return;
  }

  isLoading.value = true;

  try {
    const res = (await http.post('/auth/login', {
      email: formData.email,
      password: formData.password
    })).data
    setUserData(res)
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Авторизация прошла успешно!',
      life: 3000
    });

    Object.assign(formData, {
      email: "",
      password: ""
    });

    Object.assign(initialValues, {
      email: "",
      password: ""
    });

    Object.keys(errors).forEach(key => delete errors[key as keyof IErrors]);

    if (formRef.value) {
      formRef.value.reset();
    }
    if (res.token) {
      await router.push('/');
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Произошла ошибка при авторизации',
      life: 3000
    });
  } finally {
    isLoading.value = false;
  }
};


const onEmailChange = () => {
  validateField('email');
};

const onPasswordChange = () => {
  validateField('password');
};
</script>

<template>
  <div class="flex items-center justify-center min-h-screen p-4">
    <Card class="w-full max-w-md bg-white/95 rounded-2xl border border-white/20">
      <template #title>
        <h2 class="text-2xl font-bold text-center text-white mb-2">
          Авторизация
        </h2>
      </template>

      <template #content>
        <Form
            ref="formRef"
            :initialValues
            :resolver="resolver"
            @submit="onSubmit"
            class="space-y-6"
        >
          <div class="space-y-2">
            <label for="email" class="block text-sm font-medium text-white">
              Email
            </label>
            <InputText
                id="email"
                v-model="formData.email"
                :invalid="!!errors.email"
                placeholder="Введите email"
                type="email"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg"
                @input="onEmailChange"
            />
            <Message
                v-if="errors.email"
                :closable="false"
                severity="error"
                class="mt-1 text-sm"
            >
              {{ errors.email }}
            </Message>
          </div>
          <div class="space-y-2">
            <label for="password" class="block text-sm font-medium text-white">
              Пароль
            </label>
            <Password
                id="password"
                v-model="formData.password"
                :invalid="!!errors.password"
                placeholder="Введите пароль"
                toggle-mask
                :feedback="false"
                class="w-full"
                input-class="w-full px-4 py-3 border border-gray-300 rounded-lg"
                @input="onPasswordChange"
            />
            <Message
                v-if="errors.password"
                :closable="false"
                severity="error"
                class="mt-1 text-sm"
            >
              {{ errors.password }}
            </Message>
          </div>
          <div class="pt-4">
            <Button
                type="submit"
                label="Войти"
                :loading="isLoading"
                severity="success"
                class="w-full py-3 px-6 text-white font-semibold"
                size="large"
            />
          </div>
          <div class="flex items-center justify-center space-x-2 pt-4 text-sm">
            <router-link to="/signup" class="text-white  hover:underline transition-colors">
              Нет акканута ?
            </router-link>
          </div>
        </Form>
      </template>
    </Card>
  </div>
</template>
