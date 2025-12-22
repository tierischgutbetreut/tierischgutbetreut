import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookingModal } from "@/components/booking-modal"
import { 
  Home, 
  Heart, 
  Clock, 
  Shield, 
  Phone,
  MapPin,
  Calendar,
  Euro,
  AlertCircle,
  Info,
  CheckCircle,
  Car,
  Pill,
  Key,
  MessageCircle
} from "lucide-react"
import Image from "next/image"

const services = [
  "Füttern",
  "Näpfe reinigen",
  "Frisches Wasser",
  "Spielen, bürsten, beschäftigen",
  "Gesellschaft leisten",
  "Missgeschicke bereinigen"
]

const priceList = [
  {
    service: "Erstgespräch",
    price: "25€",
    duration: "ca. 30 Min vor Ort",
    icon: Calendar
  },
  {
    service: "1 Besuch/Tag",
    price: "14,50€",
    duration: "ca. 30 Min je Besuch",
    icon: Clock
  },
  {
    service: "2 Besuche/Tag", 
    price: "12,50€",
    duration: "ca. 30 Min je Besuch",
    icon: Clock
  }
]

const additionalServices = [
  { service: "Streu komplett tauschen", price: "10€", unit: "pauschal", icon: Home },
  { service: "Medikamentengabe", price: "1,50€", unit: "je Gabe", icon: Pill },
  { service: "Schlüssel holen/bringen", price: "5€", unit: "je holen und bringen", icon: Key },
  { service: "Fahrtkosten", price: "0,55€/km", unit: "An- und Abfahrt", icon: Car },
  { service: "Sonn- und Feiertagszuschlag", price: "50%", unit: "auf den vereinbarten Tagespreis", icon: Calendar }
]

const cancellationPolicy = [
  { period: "15 Tage und mehr vor Betreuungsbeginn", refund: "100% Rückerstattung" },
  { period: "14-7 Tage vor Betreuungsbeginn", refund: "50% Rückerstattung" },
  { period: "6 Tage und weniger vor Betreuungsbeginn", refund: "keine Rückerstattung" }
]

const importantNotes = [
  "Alle Preise verstehen sich netto, auf der Rechnung werden 19% USt. ausgewiesen",
  "Die Steuer kann beim Finanzamt als 'haushaltsnahe Dienstleistung' abgesetzt werden",
  "Leistungen werden im Voraus beim Erstgespräch definiert und in einem Angebot zugesandt",
  "Medikamentengabe nur möglich, wenn die Katze zutraulich ist",
  "Rechnungsbetrag ist vor Betreuungsbeginn in voller Höhe zu begleichen",
  "Im Preis enthalten ist eine Haftpflichtversicherung gegen Schäden oder Schlüsselverlust"
]

export default function KatzenbetreuungPage() {
  return (
    <main className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sage-50 to-sage-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-sage-600 text-white mb-4">Katzenbetreuung</Badge>
              <h1 className="font-raleway text-4xl lg:text-5xl font-bold text-sage-900 mb-6">
                Deine Samtpfote in besten Händen
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Katzen lieben ihre gewohnte Umgebung. Sie in Urlaub außer Haus zu geben, bringt ihr ordentlich Stress. 
                Die Betreuung in gewohnter Umgebung ist die beste Lösung für die Zeit Deiner Abwesenheit.
              </p>
              <p className="text-lg text-sage-700 font-medium mb-8">
                Ist Deine Mieze ein Freigänger, so kann sie ihren ganz normalen Gewohnheiten nachgehen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <BookingModal animalType="cat">
                  <Button className="bg-sage-600 hover:bg-sage-700 text-white" size="lg">
                    Jetzt unverbindlich anfragen
                  </Button>
                </BookingModal>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/images/pexels-kerber-774731.jpg"
                alt="Katze in gewohnter Umgebung"
                width={600}
                height={400}
                className="rounded-2xl shadow-lg border-8 border-white"
                priority
              />
              <div className="absolute top-4 right-4 bg-sage-600 text-white px-4 py-2 rounded-full font-semibold">
                ab 12,50€/Besuch
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-raleway text-3xl lg:text-4xl font-bold text-sage-900 mb-4">
              Unsere Katzenbetreuung beinhaltet
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Ein Besuch dauert 30 Minuten und umfasst alle wichtigen Leistungen für das Wohlbefinden Deiner Katze.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="border-sage-200 hover:shadow-lg transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle className="h-5 w-5 text-sage-600 flex-shrink-0" />
                    <span className="text-gray-700 text-center">{service}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="bg-sage-50 p-6 rounded-lg max-w-4xl mx-auto">
              <p className="text-sage-800 font-medium">
                Selbstverständlich wird das Katzenkistchen gereinigt (nur Hinterlassenschaften, keine Vollreinigung) und um das Katzenkistchen gefegt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 lg:py-24 bg-sage-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-raleway text-3xl lg:text-4xl font-bold text-sage-900 mb-4">
              Preise
            </h2>
            <p className="text-lg text-gray-600">
              Transparente Preisgestaltung für alle Leistungen
            </p>
          </div>

          {/* Main Prices */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {priceList.map((item, index) => (
              <Card key={index} className="border-sage-200 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-6 w-6 text-sage-600" />
                  </div>
                  <CardTitle className="text-sage-900">{item.service}</CardTitle>
                  <div className="text-3xl font-bold text-sage-600 mt-2">{item.price}</div>
                  <p className="text-sm text-gray-600">{item.duration}</p>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Additional Services */}
          <div className="mb-12">
            <h3 className="font-raleway text-2xl font-bold text-sage-900 mb-6 text-center">
              Zusätzliche Leistungen
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {additionalServices.map((service, index) => (
                <Card key={index} className="border-sage-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <service.icon className="h-5 w-5 text-sage-600" />
                        <span className="text-gray-700">{service.service}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sage-900">{service.price}</div>
                        <div className="text-sm text-gray-600">{service.unit}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cancellation Policy */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-raleway text-3xl lg:text-4xl font-bold text-sage-900 mb-4">
              Stornierungsbedingungen
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {cancellationPolicy.map((policy, index) => (
              <Card key={index} className="border-sage-200">
                <CardContent className="pt-6 text-center">
                  <div className="text-lg font-semibold text-sage-900 mb-2">
                    {policy.period}
                  </div>
                  <div className="text-sage-600">{policy.refund}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-16 lg:py-24 bg-sage-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-raleway text-3xl lg:text-4xl font-bold text-sage-900 mb-4">
              Wichtige Hinweise
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-sage-200">
              <CardHeader>
                <CardTitle className="text-sage-900 flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Allgemeine Bedingungen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {importantNotes.map((note, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-sage-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{note}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-900 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Wichtige Hinweise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-orange-800">
                <p>• Für einen genauen Betreuungspreis machen wir Dir ein unverbindliches Angebot</p>
                <p>• Betreuungstage werden nicht zurückerstattet bei vorzeitiger Rückkehr aus dem Urlaub</p>
                <p>• Bitte rechtzeitig absagen, wenn der Urlaub nicht zustande kommt</p>
                <p>• Reservierte Zeit wird bei Nichterscheinen in voller Höhe in Rechnung gestellt</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-sage-600 text-white p-8 rounded-lg text-center">
            <h3 className="font-raleway text-xl font-bold mb-4">
              Wir sind da wenn Du uns brauchst
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                <span>0176-724 045 61</span>
              </div>
              <div className="text-sage-100">
                Anruf oder WhatsApp
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-16 lg:py-24 bg-sage-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-raleway text-3xl lg:text-4xl font-bold mb-6">
            Deine Samtpfote verdient die beste Betreuung
          </h2>
          <p className="text-lg text-sage-100 mb-8">
            Vereinbare jetzt ein unverbindliches Erstgespräch und lass uns gemeinsam die perfekte Betreuung für Deine Katze planen.
          </p>
          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="bg-green-600 text-white hover:bg-green-700"
              asChild
            >
              <a 
                href="https://wa.me/4917672404561" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                WhatsApp schreiben
              </a>
            </Button>
          </div>
          <div className="mt-8 pt-8 border-t border-sage-500">
            <p className="text-sage-100">
              <strong>Kontakt:</strong> 0176-724 045 61 (WhatsApp/Anruf) • info@tierischgutbetreut.de
            </p>
          </div>
        </div>
      </section>
    </main>
  )
} 