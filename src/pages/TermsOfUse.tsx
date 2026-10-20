import LegalPage, { LegalSection } from "@/pages/LegalPage";

export default function TermsOfUse() {
  return (
    <LegalPage title="Termos de Uso" updatedAt="20 de outubro de 2026">
      <p>
        Estes Termos de Uso regulam o acesso e a utilização da plataforma Nexus Automação,
        destinada à gestão de salões, barbearias, spas e negócios de estética. Ao criar uma conta
        ou utilizar a plataforma, você declara que leu e concorda com estas condições.
      </p>

      <LegalSection title="1. Sobre a plataforma">
        <p>
          A Nexus Automação oferece recursos para organização de agenda, clientes, serviços,
          profissionais, produtos, vendas, estoque, relatórios, comunicação e outras rotinas de
          gestão. Os recursos disponíveis podem variar conforme o plano contratado e as
          configurações do estabelecimento.
        </p>
      </LegalSection>

      <LegalSection title="2. Cadastro e responsabilidade da conta">
        <p>
          O responsável pelo estabelecimento deve fornecer informações verdadeiras, manter os
          dados atualizados e proteger suas credenciais de acesso. A conta e as permissões de cada
          usuário devem ser utilizadas somente por pessoas autorizadas pelo estabelecimento.
        </p>
      </LegalSection>

      <LegalSection title="3. Uso permitido">
        <p>
          A plataforma deve ser utilizada de forma lícita, ética e compatível com sua finalidade.
          É proibido tentar acessar dados de outro estabelecimento, contornar controles de
          segurança, interferir no funcionamento do serviço ou utilizar a plataforma para práticas
          fraudulentas, abusivas ou ilegais.
        </p>
      </LegalSection>

      <LegalSection title="4. Dados e conteúdo do estabelecimento">
        <p>
          O estabelecimento é responsável pelos dados inseridos na plataforma, pelos agendamentos
          realizados, pelas comunicações enviadas aos clientes e pelas autorizações necessárias
          para utilizar essas informações. O usuário deve evitar inserir conteúdo ilícito ou dados
          que não tenha autorização para tratar.
        </p>
      </LegalSection>

      <LegalSection title="5. Planos, teste e pagamentos">
        <p>
          O acesso pode começar por um período de teste ou por um plano pago, conforme a oferta
          vigente no momento da contratação. Quando houver cobrança recorrente, o pagamento será
          processado pelo provedor indicado no checkout. O acesso poderá ser limitado ou encerrado
          em caso de cancelamento, inadimplência, reembolso ou encerramento do plano.
        </p>
      </LegalSection>

      <LegalSection title="6. Disponibilidade e suporte">
        <p>
          A Nexus busca manter a plataforma disponível e segura, mas podem ocorrer interrupções
          temporárias para manutenção, atualizações, falhas de provedores ou eventos fora do seu
          controle. O suporte é prestado pelos canais informados na plataforma ou na contratação.
        </p>
      </LegalSection>

      <LegalSection title="7. Propriedade intelectual">
        <p>
          A plataforma, sua identidade visual, código, textos, marcas e componentes pertencem à
          Nexus Automação ou aos respectivos licenciadores. Estes Termos não transferem ao usuário
          qualquer direito de propriedade sobre esses elementos.
        </p>
      </LegalSection>

      <LegalSection title="8. Encerramento">
        <p>
          O usuário pode deixar de utilizar a plataforma conforme as regras do plano contratado.
          A Nexus poderá suspender ou encerrar o acesso quando houver violação destes Termos,
          risco à segurança, fraude ou exigência legal, observadas as obrigações aplicáveis.
        </p>
      </LegalSection>

      <LegalSection title="9. Alterações destes termos">
        <p>
          Estes Termos podem ser atualizados para refletir mudanças legais, operacionais ou de
          produto. A versão vigente ficará disponível nesta página, com a data da última
          atualização.
        </p>
      </LegalSection>

      <LegalSection title="10. Contato">
        <p>
          Para dúvidas sobre estes Termos de Uso, entre em contato com a Nexus Automação pelos
          canais oficiais apresentados na plataforma.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
