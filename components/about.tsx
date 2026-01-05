import { Card, CardContent } from "@/components/ui/card"
import { Award, Heart, Users } from "lucide-react"
import Image from "next/image"

export function About() {
  return (
    <section className="py-16 lg:py-24 bg-sage-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-raleway text-3xl lg:text-4xl font-bold text-sage-900 mb-4">(D)ein Team für alle Felle</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Wir sind da wenn Du uns brauchst! Ganz gleich, ob Du in den Urlaub fährst, krank bist, einen Termin beim Tierarzt oder Groomer aus Zeitgründen nicht wahrnehmen kannst oder Dein eigentlicher Gassigänger/Katzensitter ausfällt - wir sind gerne für Dich und Deine Fellnase da!
          </p>
        </div>

        {/* Tamara Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h3 className="font-raleway text-2xl font-bold text-sage-900">Tamara Pfaff</h3>
            <p className="text-gray-600 leading-relaxed">
              Mit Hunden und Katzen habe ich seit meiner Kindheit zu tun. Ob eigenes Haustier oder auch ehrenamtliche Hundenanny im Tierheim - ohne Fellnase war mein Leben noch nie!
            </p>
            <p className="text-gray-600 leading-relaxed">
              Aktuell beglückt mich unser Boxermädchen Luna mit ihrer Anwesenheit. Tiefes Verständnis für individuelle Bedürfnisse des einzelnen Tieres eignete ich mir in fachspezifischen Kursen und Ausbildungen, aber vor allem in der Praxis an.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Als stellvertretende Leitung auf einem Schweizer Hunde-Gnadenhof konnte ich unglaublich viel Erfahrung mit verhaltensoriginellen Hunden sammeln. Für mich gibt es keine schwierigen Felle sondern nur große Herausforderungen! Und ich liebe Herausforderungen.
            </p>
          </div>

          <div className="relative">
            <Image
              src="/images/tigube_Tamara_Pfaff.jpg"
              alt="Tamara Pfaff - Geschäftsführerin tierisch gut betreut"
              width={250}
              height={200}
              className="rounded-2xl shadow-lg w-full max-w-sm h-auto object-cover mx-auto"
            />
          </div>
        </div>

        {/* Gabriel Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="relative order-2 lg:order-1">
            <Image
              src="/images/tigube_Gabriel_Haaga.jpg"
              alt="Gabriel Haaga - Geschäftsführer tierisch gut betreut"
              width={250}
              height={200}
              className="rounded-2xl shadow-lg w-full max-w-sm h-auto object-cover mx-auto"
            />
          </div>

          <div className="space-y-6 order-1 lg:order-2">
            <h3 className="font-raleway text-2xl font-bold text-sage-900">Gabriel Haaga</h3>
            <p className="text-gray-600 leading-relaxed">
              Hunde waren mir als Kind nicht ganz geheuer. Als mich ein kleiner Dackel beim Spielen abschleckte dachte ich, der frisst mich gleich. Aber dem war nicht so!
            </p>
            <p className="text-gray-600 leading-relaxed">
              Das war verrückterweise der Beginn meiner großen Liebe zu Hunden. Mit Lunchen habe ich den ersten eigenen Hund und will natürlich mein Bestes geben im Umgang und in der Erziehung.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Aus diesem Grund habe ich mit Mara zusammen eine Ausbildung zum Hundetrainer und Problemhunde-Therapeuten gemacht. Das Wissen kommt hier nicht nur bei uns zu Hause zum Einsatz, sondern vor allem im Umgang mit besonderen Hunden in unserer Pension.
            </p>
          </div>
        </div>

        {/* Unsere Hunde Section */}
        <div className="text-center mb-16">
          <h3 className="font-raleway text-2xl font-bold text-sage-900 mb-6">Unsere pelzigen Kollegen</h3>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Luna ist nicht nur unser Familienmitglied, sondern auch unsere beste Lehrmeisterin. 
            Sie zeigt uns täglich, was es heißt, bedingungslos zu lieben, im Moment zu leben und dass ein Leckerli 
            alle Probleme der Welt lösen kann. Außerdem ist sie unsere strengste Qualitätsprüferin - 
            wer bei ihr punktet, hat definitiv das Zeug zum Tierflüsterer! 🐕
          </p>
          
          <div className="flex justify-center gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <Image
                src="/images/Boxer_Hund_Luna.jpg"
                alt="Luna - Boxermädchen von Tamara"
                width={250}
                height={200}
                className="rounded-2xl shadow-lg w-full max-w-xs h-auto object-cover mx-auto mb-4"
              />
              <h4 className="font-semibold text-sage-900 mb-2">Luna</h4>
              <p className="text-sm text-gray-600">
                Boxermädchen mit Herz und Seele. Spezialistin für Herzensangelegenheiten und 
                Chefin der Qualitätskontrolle bei Streicheleinheiten.
              </p>
            </div>
            

          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mb-16">
          <div className="bg-sage-600 text-white p-8 rounded-2xl max-w-4xl mx-auto">
            <p className="text-lg font-medium mb-4">
              Ab hier wäre ein richtig guter Zeitpunkt, Kontakt zu uns aufzunehmen, um ein unverbindliches Erstgespräch zu vereinbaren.
            </p>
            <p className="text-sage-100">
              Lass uns in aller Ruhe herausfinden, ob die Chemie zwischen allen Beteiligten stimmt. Ist dem so und alle wichtigen Fragen sind geklärt und Du mit unserem Angebot einverstanden, dann können wir die Betreuung in dringenden Fällen auch kurzfristig übernehmen.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center border-sage-200">
            <CardContent className="pt-8 pb-6">
              <Award className="h-12 w-12 text-sage-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-sage-900 mb-2">15+</div>
              <div className="text-gray-600">Jahre Erfahrung</div>
            </CardContent>
          </Card>

          <Card className="text-center border-sage-200">
            <CardContent className="pt-8 pb-6">
              <Users className="h-12 w-12 text-sage-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-sage-900 mb-2">400+</div>
              <div className="text-gray-600">Zufriedene Kunden</div>
            </CardContent>
          </Card>

          <Card className="text-center border-sage-200">
            <CardContent className="pt-8 pb-6">
              <Heart className="h-12 w-12 text-sage-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-sage-900 mb-2">500+</div>
              <div className="text-gray-600">Betreute Tiere</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
