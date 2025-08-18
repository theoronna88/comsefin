"use client";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

import { signIn, getSession, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const LoginPage = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session, status } = useSession();
  const router = useRouter();
  const formSchema = z.object({
    username: z.string().min(1, "Usuário é obrigatório"),
    password: z.string().min(1, "Senha é obrigatória"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log(data);
    try {
      const res = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        console.error("Erro de autenticação:", res.error);
        setError("Credenciais inválidas. Verifique seu usuário e senha.");
        if (res.error.includes("Token ContaAzul não encontrado")) {
          setError("Faça login novamente com a Conta Azul primeiro.");
        }
      } else if (res?.ok) {
        // Verificar se a sessão foi criada corretamente
        const session = await getSession();
        if (session) {
          router.push("/user");
          // router.refresh();
        } else {
          setError("Erro ao criar sessão. Tente novamente.");
        }
      }
    } catch (error) {
      console.error("Erro no login: ", error);
      setError("Erro interno do servidor. Tente novamente mais tarde");
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[960px] h-[750px] p-0 m-0 shadow-lg">
          <CardContent className="grid grid-cols-2 p-0 m-0 h-full ">
            {/* Left side: Image */}
            <div className="flex items-center justify-center w-full h-full">
              <Image
                src="/bi_login.jpg"
                width={475}
                height={900}
                alt="Login Illustration"
                className="rounded-l-lg h-full"
              />
            </div>
            {/* Right side: Form */}
            <div className="flex flex-col justify-center items-center  ">
              <Form {...form}>
                <form
                  className="flex flex-col justify-center gap-4 500 w-11/12 p-8"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usuário</FormLabel>
                        <FormControl>
                          <Input placeholder="Usuário" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input placeholder="Senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-red-500 font-bold text-sm">{error}</p>
                  <Button type="submit" className="bg-blue-700">
                    Entrar
                  </Button>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default LoginPage;
