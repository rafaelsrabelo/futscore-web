import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-2">Política de Privacidade - FutScore</h1>
      <p className="text-muted-foreground mb-8">
        <strong>Última atualização:</strong> 22 de novembro de 2025
      </p>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Informações que Coletamos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">1.1 Informações Fornecidas por Você</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Nome completo</li>
                <li>CPF (apenas para atletas)</li>
                <li>Email</li>
                <li>Data de nascimento</li>
                <li>Endereço</li>
                <li>Telefone de contato</li>
                <li>Informações profissionais (posição, time, empresário)</li>
                <li>Fotos de perfil</li>
                <li>Vídeos de lances e partidas</li>
                <li>Biografia e redes sociais</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">1.2 Informações Coletadas Automaticamente</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Dados de uso do aplicativo</li>
                <li>Favoritos e buscas salvas</li>
                <li>Estatísticas de desempenho em partidas</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">1.3 Login Social</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Google Sign-In: nome, email, foto de perfil</li>
                <li>Apple Sign-In: nome, email (se autorizado)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Como Usamos Suas Informações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">Usamos suas informações para:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Criar e gerenciar perfis de atletas</li>
              <li>Conectar atletas e observadores</li>
              <li>Registrar partidas, lances e estatísticas</li>
              <li>Melhorar a experiência do usuário</li>
              <li>Autenticar e proteger contas</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Compartilhamento de Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Visibilidade pública:</strong> Perfis de atletas são visíveis para observadores cadastrados
              </li>
              <li>
                <strong className="text-foreground">Não vendemos dados:</strong> Nunca vendemos suas informações pessoais
              </li>
              <li>
                <strong className="text-foreground">Serviços terceiros:</strong> Usamos serviços confiáveis para hospedagem e armazenamento (Render, Cloudflare R2)
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Segurança</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">Implementamos medidas de segurança para proteger seus dados:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Criptografia de dados sensíveis</li>
              <li>Autenticação segura</li>
              <li>Armazenamento em servidores seguros</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Seus Direitos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">Você tem direito a:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Acessar seus dados</li>
              <li>Corrigir informações incorretas</li>
              <li>Deletar sua conta</li>
              <li>Exportar seus dados</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Retenção de Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário para fornecer os serviços.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Uso por Crianças e Adolescentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              <strong className="text-foreground">O FutScore é uma plataforma voltada para atletas de todas as idades, incluindo crianças e jovens que estão começando no futebol.</strong>
            </p>

            <div>
              <h3 className="font-semibold text-lg mb-2">7.1 Supervisão Parental Obrigatória</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Crianças menores de 13 anos:</strong> DEVEM ter a conta criada, gerenciada e administrada exclusivamente por um pai ou responsável legal.
                </li>
                <li>
                  <strong className="text-foreground">Adolescentes entre 13 e 18 anos:</strong> Recomendamos fortemente a supervisão dos pais/responsáveis.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">7.2 Responsabilidade dos Pais/Responsáveis</h3>
              <p className="text-muted-foreground mb-2">Os pais ou responsáveis legais são responsáveis por:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Criar e configurar o perfil da criança</li>
                <li>Fazer upload de vídeos de lances e partidas</li>
                <li>Registrar estatísticas e informações de scout</li>
                <li>Gerenciar informações pessoais e de contato</li>
                <li>Monitorar a atividade e interações no aplicativo</li>
                <li>Aprovar e supervisionar o uso da plataforma</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">7.3 Proteção de Menores</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Não permitimos comunicação direta entre observadores e crianças menores de 13 anos sem autorização dos pais</li>
                <li>Os pais/responsáveis têm controle total sobre a visibilidade do perfil</li>
                <li>Qualquer contato de observadores deve ser feito através dos dados de contato dos pais/responsáveis</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">7.4 Consentimento Parental</h3>
              <p className="text-muted-foreground mb-2">Ao criar uma conta para uma criança menor de 13 anos, o pai ou responsável confirma que:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>É o responsável legal pela criança</li>
                <li>Autoriza a coleta e uso das informações conforme esta política</li>
                <li>Administrará a conta em nome da criança</li>
                <li>Supervisionará todas as atividades no aplicativo</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Alterações na Política</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas através do email cadastrado.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Contato</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">Para questões sobre privacidade ou uso por menores:</p>
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
