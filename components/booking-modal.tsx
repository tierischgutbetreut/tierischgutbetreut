"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Mail, Loader2 } from "lucide-react"

type AnimalType = 'dog' | 'cat'

interface BookingModalProps {
  animalType: AnimalType
  children: React.ReactNode
}

const content = {
  dog: {
    title: "Unverbindliche Anfrage",
    subtitle: "🐕 Wuff! Zeit für ein erstes Beschnuppern",
    description: "",
    servicePlaceholder: "z.B. Hund, Goldi, Name, Rasse"
  },
  cat: {
    title: "Unverbindliche Anfrage", 
    subtitle: "🐱 Miau! Zeit für eine königliche Audienz",
    description: "",
    servicePlaceholder: "z.B. Katze, Name, Rasse"
  }
}

const services = {
  dog: [
    "Tagesbetreuung",
    "Urlaubsbetreuung", 
    "Hundepension",
    "Notfallbetreuung",
    "Beratung"
  ],
  cat: [
    "Mobile Katzenbetreuung",
    "Urlaubsbetreuung",
    "Tagesbetreuung", 
    "Notfallbetreuung",
    "Beratung"
  ]
}

export function BookingModal({ animalType, children }: BookingModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    animal: '',
    service: '',
    message: '',
    availability: '',
    privacy: false
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const currentContent = content[animalType]
  const currentServices = services[animalType]

  // Validierung für Pflichtfelder
  const isFormValid = formData.name.trim() !== '' && 
                     formData.email.trim() !== '' && 
                     formData.phone.trim() !== '' && 
                     formData.message.trim() !== '' && 
                     formData.availability.trim() !== '' && 
                     formData.privacy

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    
    try {
      // Formular-Daten für Backend vorbereiten
      const formDataToSend = {
        ...formData,
        animalType: animalType === 'dog' ? 'Hundebetreuung' : 'Katzenbetreuung',
        subject: `Unverbindliche Anfrage - ${animalType === 'dog' ? 'Hundebetreuung' : 'Katzenbetreuung'}`,
        timestamp: new Date().toISOString()
      }

      // API-Call zum Backend
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataToSend)
      })
      
      const success = response.ok
      
      if (success) {
        setSubmitStatus('success')
        // Formular zurücksetzen nach erfolgreicher Übertragung
        setTimeout(() => {
          setFormData({
            name: '', email: '', phone: '', animal: '', 
            service: '', message: '', availability: '', privacy: false
          })
          setSubmitStatus('idle')
        }, 3000)
      } else {
        setSubmitStatus('error')
      }
      
    } catch (error) {
      console.error('Fehler beim Senden:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-raleway text-2xl text-sage-900">
            {currentContent.title}
          </DialogTitle>
          <DialogDescription className="text-lg text-sage-700 font-medium">
            {currentContent.subtitle}
          </DialogDescription>
          <p className="text-gray-600 mt-2 text-sm leading-relaxed">
            {currentContent.description}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ihr Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-white border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail Adresse *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-white border-gray-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefonnummer *</Label>
              <Input
                id="phone"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="bg-white border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="animal">Ihr Tier</Label>
              <Input
                id="animal"
                placeholder={currentContent.servicePlaceholder}
                value={formData.animal}
                onChange={(e) => setFormData({...formData, animal: e.target.value})}
                className="bg-white border-gray-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">Gewünschte Leistung</Label>
            <Select value={formData.service} onValueChange={(value) => setFormData({...formData, service: value})}>
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue placeholder="Bitte wählen" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                {currentServices.map((service) => (
                  <SelectItem 
                    key={service} 
                    value={service}
                    className="bg-white hover:bg-sage-50 text-gray-900 cursor-pointer"
                  >
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Ihre Nachricht *</Label>
            <Textarea
              id="message"
              placeholder="Erzählen Sie uns mehr über Ihr Tier und Ihre Wünsche..."
              required
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="bg-white border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">Wann sind Sie am besten erreichbar? *</Label>
            <Input
              id="availability"
              placeholder="z.B. Montag-Freitag 18-20 Uhr, Wochenende ganztags"
              required
              value={formData.availability}
              onChange={(e) => setFormData({...formData, availability: e.target.value})}
              className="bg-white border-gray-300"
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="privacy"
              required
              checked={formData.privacy}
              onCheckedChange={(checked) => setFormData({...formData, privacy: checked as boolean})}
              className="mt-0.5"
            />
            <Label htmlFor="privacy" className="text-xs leading-relaxed">
              Ich stimme der Verarbeitung meiner Daten gemäß der <a href="/datenschutz" className="text-sage-600 hover:underline">Datenschutzerklärung</a> zu. *
            </Label>
          </div>

          <DialogFooter className="mt-6">
            {submitStatus === 'success' && (
              <div className="w-full text-center p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                <p className="text-green-800 font-medium">✅ Vielen Dank! Ihre Anfrage wurde erfolgreich gesendet.</p>
                <p className="text-green-600 text-sm mt-1">Wir melden uns schnellstmöglich bei Ihnen!</p>
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="w-full text-center p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-red-800 font-medium">❌ Fehler beim Senden</p>
                <p className="text-red-600 text-sm mt-1">Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.</p>
              </div>
            )}
            
            <Button
              type="submit"
              className="bg-sage-600 hover:bg-sage-700 text-white w-full sm:w-auto disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Anfrage senden
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 