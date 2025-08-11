<script setup lang="ts">
import {reactive, ref} from "vue";
import {useRouter} from "vue-router";
import {Button, Card, InputText, Message, Password, useToast} from "primevue";
import {Form} from "@primevue/forms";
import {http} from "../../api/http.ts";
import type {IToken} from "../../types/user.ts";
import {useUserStore} from "../../store/user.ts";

interface IValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

interface IErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
}

const formData = reactive<IValues>({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
});

const router = useRouter();
const {setUserData} = useUserStore()
const errors = reactive<IErrors>({});
const toast = useToast();
const isLoading = ref(false);
const formRef = ref();

const initialValues = reactive<IValues>({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
});

const resolver = ({values}: { values: IValues }) => {
  Object.assign(formData, values);

  Object.keys(errors).forEach(key => delete errors[key as keyof IErrors]);

  if (!formData.firstName.trim()) {
    errors.firstName = 'Имя обязательно';
  } else if (formData.firstName.length < 2) {
    errors.firstName = 'Имя должно содержать минимум 2 символа';
  }

  if (!formData.lastName.trim()) {
    errors.lastName = 'Фамилия обязательна';
  } else if (formData.lastName.length < 2) {
    errors.lastName = 'Фамилия должна содержать минимум 2 символа';
  }

  if (!formData.username.trim()) {
    errors.username = 'Имя пользователя обязательно';
  } else if (formData.username.length < 3) {
    errors.username = 'Имя пользователя должно содержать минимум 3 символа';
  } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
    errors.username = 'Имя пользователя может содержать только буквы, цифры и знак подчеркивания';
  }
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
  } else if (formData.password.length < 8) {
    errors.password = 'Пароль должен содержать минимум 8 символов';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
    errors.password = 'Пароль должен содержать хотя бы одну заглавную букву, строчную букву и цифру';
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Подтверждение пароля обязательно';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Пароли не совпадают';
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
  if (field === 'firstName') {
    if (formData.firstName.trim() && formData.firstName.length >= 2) {
      delete errors.firstName;
    }
  } else if (field === 'lastName') {
    if (formData.lastName.trim() && formData.lastName.length >= 2) {
      delete errors.lastName;
    }
  } else if (field === 'username') {
    if (formData.username.trim() && formData.username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(formData.username)) {
      delete errors.username;
    }
  } else if (field === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email.trim() && emailRegex.test(formData.email)) {
      delete errors.email;
    }
  } else if (field === 'password') {
    if (formData.password && formData.password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      delete errors.password;
    }
  } else if (field === 'confirmPassword') {
    if (formData.confirmPassword && formData.password === formData.confirmPassword) {
      delete errors.confirmPassword;
    }
  }
};

const isFormValid = (): boolean => {
  return !errors.firstName && !errors.lastName && !errors.username && !errors.email && !errors.password && !errors.confirmPassword &&
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.username.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.password !== '' &&
      formData.confirmPassword !== ''
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
    const res: IToken = (await http.post('/auth/register', {
      username: formData.username,
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      role: 'user'
    })).data
    setUserData(res)

    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Регистрация прошла успешно! Проверьте email для подтверждения.',
      life: 5000
    });

    Object.assign(formData, {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    });

    Object.assign(initialValues, {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    });

    Object.keys(errors).forEach(key => delete errors[key as keyof IErrors]);

    if (formRef.value) {
      formRef.value.reset();
    }
    if (res.token) {
      await router.push('/');
    }
  } catch (error) {
    console.log("toast", toast)
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Произошла ошибка при регистрации',
      life: 3000
    });
  } finally {
    isLoading.value = false;
  }
};

const onFirstNameChange = () => validateField('firstName');
const onLastNameChange = () => validateField('lastName');
const onUsernameChange = () => validateField('username');
const onEmailChange = () => validateField('email');
const onPasswordChange = () => {
  validateField('password');
  if (formData.confirmPassword) {
    validateField('confirmPassword');
  }
};
const onConfirmPasswordChange = () => validateField('confirmPassword');
</script>

<template>
  <div class="flex items-center justify-center min-h-screen p-4">
    <Card class="w-full max-w-lg shadow-2xl backdrop-blur-sm bg-white/95 rounded-2xl border border-white/20">
      <template #title>
        <h2 class="text-2xl font-bold text-center text-white mb-2">
          Регистрация
        </h2>
      </template>

      <template #content>
        <Form
            ref="formRef"
            :initialValues
            :resolver
            @submit="onSubmit"
            class="space-y-5"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label for="firstName" class="block text-sm font-medium text-white">
                Имя
              </label>
              <InputText
                  id="firstName"
                  v-model="formData.firstName"
                  :invalid="!!errors.firstName"
                  placeholder="Введите имя"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  @input="onFirstNameChange"
              />
              <Message
                  v-if="errors.firstName"
                  :closable="false"
                  severity="error"
                  class="mt-1 text-sm"
              >
                {{ errors.firstName }}
              </Message>
            </div>
            <div class="space-y-2">
              <label for="lastName" class="block text-sm font-medium text-white">
                Фамилия
              </label>
              <InputText
                  id="lastName"
                  v-model="formData.lastName"
                  :invalid="!!errors.lastName"
                  placeholder="Введите фамилию"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  @input="onLastNameChange"
              />
              <Message
                  v-if="errors.lastName"
                  :closable="false"
                  severity="error"
                  class="mt-1 text-sm"
              >
                {{ errors.lastName }}
              </Message>
            </div>
          </div>
          <div class="space-y-2">
            <label for="username" class="block text-sm font-medium text-white">
              Имя пользователя
            </label>
            <InputText
                id="username"
                v-model="formData.username"
                :invalid="!!errors.username"
                placeholder="Введите имя пользователя"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg"
                @input="onUsernameChange"
            />
            <Message
                v-if="errors.username"
                :closable="false"
                severity="error"
                class="mt-1 text-sm"
            >
              {{ errors.username }}
            </Message>
          </div>
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
                :feedback="true"
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
              {{ errors.password }}lox
            </Message>
          </div>
          <div class="space-y-2">
            <label for="confirmPassword" class="block text-sm font-medium text-white">
              Подтверждение пароля
            </label>
            <Password
                id="confirmPassword"
                v-model="formData.confirmPassword"
                :invalid="!!errors.confirmPassword"
                placeholder="Повторите пароль"
                toggle-mask
                :feedback="false"
                class="w-full"
                input-class="w-full px-4 py-3 border border-gray-300 rounded-lg"
                @input="onConfirmPasswordChange"
            />
            <Message
                v-if="errors.confirmPassword"
                :closable="false"
                severity="error"
                class="mt-1 text-sm"
            >
              {{ errors.confirmPassword }}
            </Message>
          </div>
          <div class="pt-4">
            <Button
                type="submit"
                label="Зарегистрироваться"
                :loading="isLoading"
                severity="success"
                class="w-full py-3 px-6  text-white font-semibold rounded-lg"
                size="large"
            />
          </div>
          <div class="flex items-center justify-center space-x-2 pt-4 text-sm">
            <span class="text-white">Уже есть аккаунт?</span>
            <router-link to="/login" class="text-white  hover:underline font-bold">
              Войти
            </router-link>
          </div>
        </Form>
      </template>
    </Card>
  </div>
</template>