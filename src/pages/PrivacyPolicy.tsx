import LegalPage, { LegalSection } from "@/pages/LegalPage";

export default function PrivacyPolicy() {
  return (
    <LegalPage title="Política de Privacidade" updatedAt="20 de outubro de 2026">
      <p>
        Esta Política de Privacidade explica como a Nexus Automação coleta, utiliza, armazena e
        protege informações relacionadas ao uso da plataforma e dos seus canais de atendimento.
      </p>

      <LegalSection title="1. Dados que podemos coletar">
        <p>
          Podemos coletar dados informados no cadastro e na utilização do serviço, como nome,
          e-mail, telefone, dados do estabelecimento, informações de acesso, configurações,
          agendamentos, clientes, profissionais, serviços, produtos e registros de uso. Também
          podemos receber informações técnicas necessárias para segurança, funcionamento e
          diagnóstico da plataforma.
        </p>
      </LegalSection>

      <LegalSection title="2. Como utilizamos os dados">
        <p>
          Os dados podem ser utilizados para criar e manter a conta, fornecer os recursos
          contratados, processar pagamentos, atender solicitações, enviar comunicações operacionais,
          personalizar configurações, prevenir fraudes, melhorar a plataforma e cumprir obrigações
          legais.
        </p>
      </LegalSection>

      <LegalSection title="3. Dados dos clientes do estabelecimento">
        <p>
          Quando o estabelecimento utiliza a Nexus para administrar seus próprios clientes, ele é
          responsável por definir a finalidade do tratamento e obter as autorizações necessárias.
          A Nexus trata esses dados para fornecer os recursos contratados e conforme as instruções
          legítimas do estabelecimento.
        </p>
      </LegalSection>

      <LegalSection title="4. Compartilhamento">
        <p>
          Podemos compartilhar informações com provedores necessários à operação, como serviços de
          hospedagem, autenticação, armazenamento, comunicação, pagamentos e suporte. O
          compartilhamento é limitado ao necessário para a finalidade correspondente e também pode
          ocorrer quando exigido por lei ou para proteger direitos e segurança.
        </p>
      </LegalSection>

      <LegalSection title="5. Integrações e WhatsApp">
        <p>
          Recursos de comunicação e inteligência artificial podem depender de serviços externos
          configurados pelo estabelecimento. O uso dessas integrações deve respeitar as regras dos
          respectivos provedores e as autorizações dos contatos. O estabelecimento deve manter
          controles adequados para opt-out e para interrupção de comunicações quando solicitado.
        </p>
      </LegalSection>

      <LegalSection title="6. Segurança e isolamento">
        <p>
          Utilizamos medidas técnicas e administrativas para proteger as informações, incluindo
          autenticação, controle de acesso e isolamento dos dados entre estabelecimentos. Nenhum
          sistema é totalmente imune a riscos, por isso recomendamos que os usuários protejam suas
          credenciais e comuniquem qualquer atividade suspeita.
        </p>
      </LegalSection>

      <LegalSection title="7. Retenção e exclusão">
        <p>
          Mantemos os dados pelo período necessário para fornecer o serviço, cumprir obrigações
          legais, resolver disputas e manter registros de segurança. Solicitações de acesso,
          correção ou exclusão serão analisadas conforme a legislação aplicável, os limites
          técnicos e as obrigações de retenção.
        </p>
      </LegalSection>

      <LegalSection title="8. Cookies e tecnologias semelhantes">
        <p>
          Podemos utilizar armazenamento local, cookies e tecnologias de análise para manter o
          funcionamento do site, entender a navegação, medir campanhas e melhorar a experiência.
          Algumas tecnologias podem ser gerenciadas pelo navegador ou por provedores integrados.
        </p>
      </LegalSection>

      <LegalSection title="9. Direitos do titular">
        <p>
          Conforme a legislação aplicável, o titular pode solicitar informações sobre o tratamento,
          correção, atualização, eliminação ou outras providências cabíveis. O pedido poderá exigir
          confirmação de identidade e, quando os dados forem controlados pelo estabelecimento,
          deverá ser direcionado também ao respectivo estabelecimento.
        </p>
      </LegalSection>

      <LegalSection title="10. Atualizações e contato">
        <p>
          Esta Política pode ser atualizada para refletir mudanças na plataforma ou na legislação.
          Para dúvidas ou solicitações relacionadas à privacidade, utilize os canais oficiais da
          Nexus Automação apresentados na plataforma.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
