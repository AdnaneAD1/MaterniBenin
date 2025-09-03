import { Roboto } from "next/font/google";
import { Providers } from './providers';
import "./globals.css";
import "react-datepicker/dist/react-datepicker.css";


const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata = {
  title: "Gestion des Dossiers de Maternité - Bénin",
  description: "Application web de gestion des dossiers de maternité destinée aux centres de santé béninois",
  keywords: ["maternité", "santé", "Bénin", "dossiers médicaux", "sage-femme", "CPN"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${roboto.variable} font-sans antialiased`}>
        {/* <Providers> */}
          {children}
        {/* </Providers> */}
      </body>
    </html>
  );
}
