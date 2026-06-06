import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export interface RoastCardProps {
  recipientName: string;
  senderName: string;
  roast: string;
}

export default function RoastCard({
  recipientName,
  senderName,
  roast,
}: RoastCardProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{`A birthday card just for you, ${recipientName} 🎂`}</Preview>
      <Body style={body}>
        <Container style={card}>
          <Text style={brand}>RoastCard</Text>
          <Heading style={heading}>{`Happy Birthday, ${recipientName}! 🎂`}</Heading>
          <Section style={roastSection}>
            <Text style={roastText}>{roast}</Text>
          </Section>
          <Hr style={divider} />
          <Text style={attribution}>{`${senderName}`}</Text>
        </Container>
        <Text style={footer}>Sent with love (and a little roasting) via RoastCard.</Text>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: "#f4f4f5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  margin: 0,
  padding: "40px 0",
};

const card: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  margin: "0 auto",
  maxWidth: "480px",
  padding: "40px",
  textAlign: "center",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
};

const brand: React.CSSProperties = {
  color: "#f43f5e",
  fontSize: "14px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  margin: "0 0 16px",
};

const heading: React.CSSProperties = {
  color: "#18181b",
  fontSize: "26px",
  fontWeight: 700,
  lineHeight: 1.2,
  margin: "0 0 24px",
};

const roastSection: React.CSSProperties = {
  backgroundColor: "#fafafa",
  borderRadius: "12px",
  padding: "20px",
};

const roastText: React.CSSProperties = {
  color: "#3f3f46",
  fontSize: "18px",
  lineHeight: 1.5,
  margin: 0,
};

const divider: React.CSSProperties = {
  borderColor: "#e4e4e7",
  margin: "28px 0 16px",
};

const attribution: React.CSSProperties = {
  color: "#71717a",
  fontSize: "15px",
  fontStyle: "italic",
  margin: 0,
};

const footer: React.CSSProperties = {
  color: "#a1a1aa",
  fontSize: "12px",
  margin: "24px auto 0",
  maxWidth: "480px",
  textAlign: "center",
};
