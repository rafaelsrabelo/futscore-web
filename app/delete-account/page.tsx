import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solicitar exclusão de conta e dados – FutScore",
  description:
    "Saiba como solicitar a exclusão da sua conta e dos seus dados no aplicativo FutScore.",
};

export default function DeleteAccountPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-2">
        Solicitar exclusão de conta e dados – FutScore
      </h1>
      <p className="text-muted-foreground mb-8">
        Use esta página para solicitar a exclusão da sua conta e dos seus dados
        no FutScore.
      </p>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sobre a exclusão</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              <strong>FutScore</strong> (e o desenvolvedor indicado na página do
              app na Google Play) permite que você solicite a exclusão da sua
              conta e dos seus dados a qualquer momento.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Como solicitar a exclusão da conta e dos dados</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
              <li>Abra o aplicativo <strong className="text-foreground">FutScore</strong> no seu celular.</li>
              <li>Faça login na sua conta, se necessário.</li>
              <li>Acesse a aba <strong className="text-foreground">Perfil</strong> (ícone de pessoa).</li>
              <li>Toque no botão <strong className="text-foreground">Deletar</strong> (ou &quot;Excluir conta&quot;).</li>
              <li>Leia as informações na tela e confirme que deseja excluir sua conta.</li>
              <li>Toque em <strong className="text-foreground">Deletar Tudo</strong> para confirmar.</li>
            </ol>
            <p className="text-muted-foreground mt-4">
              A exclusão é processada em seguida. Após a confirmação, você será
              deslogado e sua conta e dados vinculados serão removidos conforme
              descrito abaixo.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados que são excluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">
              Ao solicitar a exclusão da conta, os seguintes dados são removidos
              de forma permanente:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Dados da conta (e-mail, nome, foto de perfil).</li>
              <li>
                Perfil de atleta ou observador (informações pessoais, posição,
                clube, redes sociais, etc.).
              </li>
              <li>Vídeos e lances enviados.</li>
              <li>Partidas e estatísticas registradas.</li>
              <li>Favoritos e buscas salvas.</li>
              <li>Histórico de uso relacionado à sua conta.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados que podem ser mantidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>
                Registros necessários para cumprimento legal (ex.: faturamento,
                obrigações fiscais) podem ser mantidos pelo tempo exigido por
                lei.
              </li>
              <li>
                Dados anonimizados ou agregados que não permitem identificação
                podem ser mantidos para análises e melhorias do serviço.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prazo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              A exclusão da conta e dos dados é efetivada em até{" "}
              <strong className="text-foreground">30 dias</strong> a partir da
              sua solicitação. Durante esse período, a conta permanece inativa e
              os dados são removidos dos nossos sistemas.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contato</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">
              Se não conseguir excluir a conta pelo app ou tiver dúvidas, entre
              em contato pelo e-mail de suporte informado na página do
              aplicativo na Google Play.
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Email: emanuel.karlos@gmail.com</li>
              <li>Telefone: +55 85 8695-9951</li>
            </ul>
          </CardContent>
        </Card>

        <div className="text-center text-muted-foreground py-6 border-t">
          <p>© 2025 FutScore. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
