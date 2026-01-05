import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Phone, Mail, MapPin, Building2, Users, FileText, Shield } from "lucide-react"
import Link from "next/link"

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-sage-100">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-sage-600">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-raleway font-black text-white mb-6">
            Impressum & Kontakt
          </h1>
          <p className="text-xl text-sage-100 max-w-2xl mx-auto">
            Wir freuen uns über Anfragen, Kritik, Wünsche und Vorschläge
          </p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Kontaktformular */}
          <div>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sage-800">
                  <Mail className="h-5 w-5" />
                  Kontaktformular
                </CardTitle>
                <CardDescription>
                  Schreiben Sie uns eine Nachricht - wir melden uns schnellstmöglich zurück
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name, Vorname *</Label>
                    <Input id="name" placeholder="Ihr vollständiger Name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail *</Label>
                    <Input id="email" type="email" placeholder="ihre@email.de" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input id="phone" type="tel" placeholder="Ihre Telefonnummer" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Nachricht *</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Beschreiben Sie Ihren Betreuungsbedarf oder stellen Sie Ihre Frage..."
                    className="min-h-[120px]"
                    required 
                  />
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox id="privacy" required />
                  <Label htmlFor="privacy" className="text-sm text-gray-600 leading-relaxed">
                    Ich erkläre mich mit der Verarbeitung der eingegebenen Daten sowie der 
                    Datenschutzerklärung einverstanden. *
                  </Label>
                </div>
                
                <Button className="w-full bg-sage-600 hover:bg-sage-700 text-white">
                  Nachricht senden
                </Button>
                
                <p className="text-sm text-gray-500 text-center">
                  * Pflichtfelder müssen ausgefüllt werden
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Impressum Informationen */}
          <div className="space-y-8">
            {/* Unternehmensinformationen */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sage-800">
                  <Building2 className="h-5 w-5" />
                  Unternehmensinformationen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sage-800 mb-2">Firmenname</h3>
                  <p className="text-gray-700">
                    <strong>tierisch gut betreut UG</strong> (haftungsbeschränkt)
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-sage-800 mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Geschäftsführung
                  </h3>
                  <p className="text-gray-700">
                    Tamara Pfaff & Gabriel Haaga
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-sage-800 mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Anschrift
                  </h3>
                  <p className="text-gray-700">
                    Iznangerstr. 32<br />
                    78345 Moos
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Kontaktdaten */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sage-800">
                  <Phone className="h-5 w-5" />
                  Kontaktdaten
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-sage-600" />
                    <span className="font-medium">Festnetz:</span>
                    <a href="tel:+4977329885091" className="text-sage-600 hover:text-sage-700">
                      07732-988 50 91
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-sage-600" />
                    <span className="font-medium">Mobil (T. Pfaff):</span>
                    <a href="tel:+4917672404561" className="text-sage-600 hover:text-sage-700">
                      0176-724 045 61
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-sage-600" />
                    <span className="font-medium">Mobil (G. Haaga):</span>
                    <a href="tel:+4917546859977" className="text-sage-600 hover:text-sage-700">
                      0175-468 59 77
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-sage-600" />
                    <span className="font-medium">E-Mail:</span>
                    <a href="mailto:info@tierischgutbetreut.de" className="text-sage-600 hover:text-sage-700">
                      info@tierischgutbetreut.de
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rechtliche Hinweise */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sage-800">
                  <Shield className="h-5 w-5" />
                  Rechtliche Hinweise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sage-800 mb-2">Bildquellen</h3>
                  <div className="text-gray-700 text-sm space-y-1">
                    <p>Bildquelle Pixabay: StockSnap, PicsbyFran, pikabum</p>
                    <p>Foto von Helena Lopes: <a href="https://www.pexels.com/de-de/foto/kurzbeschichteter-tan-dog-2253275/" className="text-sage-600 hover:text-sage-700 underline" target="_blank" rel="noopener noreferrer">https://www.pexels.com/de-de/foto/kurzbeschichteter-tan-dog-2253275/</a></p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-sage-800 mb-2">Copyright</h3>
                  <p className="text-gray-700 text-sm">
                    © tierisch gut betreut 2025
                  </p>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <Link href="/datenschutz" className="text-sage-600 hover:text-sage-700 flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Datenschutz
                    </Link>
                    <Link href="/" className="text-sage-600 hover:text-sage-700">
                      Zurück zur Startseite
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 