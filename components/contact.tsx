"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Phone, Mail, MapPin, MessageCircle, Clock, CalendarIcon } from "lucide-react"

export function Contact() {
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    vorname: "",
    email: "",
    phone: "",
    pet: "",
    service: "",
    message: "",
    availability: "",
    privacy: false,
    // Zusätzliche Felder für Hundepension
    anzahlTiere: "",
    tiernamen: "",
    schulferienBW: false,
    konkreterUrlaub: "",
    urlaubVon: "",
    urlaubBis: "",
    intaktKastriert: "",
    alter: "",
  })

  // Helper-Funktion um Date zu YYYY-MM-DD String zu konvertieren
  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return ""
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // Helper-Funktion um YYYY-MM-DD String zu Date zu konvertieren
  const parseDateFromInput = (dateString: string): Date | undefined => {
    if (!dateString) return undefined
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? undefined : date
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    // Client-seitige Validierung für Urlaubszeitraum
    if (formData.service === 'hundepension' && formData.konkreterUrlaub === 'ja') {
      if (!formData.urlaubVon || !formData.urlaubBis) {
        setSubmitStatus({
          type: 'error',
          message: 'Bitte wählen Sie einen Urlaubszeitraum aus.',
        })
        setIsSubmitting(false)
        return
      }

      const vonDate = parseDateFromInput(formData.urlaubVon)
      const bisDate = parseDateFromInput(formData.urlaubBis)

      if (!vonDate || !bisDate) {
        setSubmitStatus({
          type: 'error',
          message: 'Bitte wählen Sie gültige Daten aus.',
        })
        setIsSubmitting(false)
        return
      }

      // Prüfe ob Enddatum nach Startdatum liegt
      if (bisDate < vonDate) {
        setSubmitStatus({
          type: 'error',
          message: 'Das Enddatum muss nach dem Startdatum liegen.',
        })
        setIsSubmitting(false)
        return
      }
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          urlaubVon: formData.urlaubVon ? parseDateFromInput(formData.urlaubVon)?.toISOString() : undefined,
          urlaubBis: formData.urlaubBis ? parseDateFromInput(formData.urlaubBis)?.toISOString() : undefined,
          timestamp: new Date().toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Senden der Anfrage')
      }

      setSubmitStatus({
        type: 'success',
        message: 'Ihre Anfrage wurde erfolgreich gesendet! Wir melden uns schnellstmöglich bei Ihnen.',
      })

      // Formular zurücksetzen
      setFormData({
        name: "",
        vorname: "",
        email: "",
        phone: "",
        pet: "",
        service: "",
        message: "",
        availability: "",
        privacy: false,
        anzahlTiere: "",
        tiernamen: "",
        schulferienBW: false,
        konkreterUrlaub: "",
        urlaubVon: "",
        urlaubBis: "",
        intaktKastriert: "",
        alter: "",
      })
    } catch (error) {
      console.error('Fehler beim Senden:', error)
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) {
    return (
      <section id="kontakt" className="py-16 lg:py-24 bg-sage-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-raleway text-3xl lg:text-4xl font-bold text-sage-900 mb-4">Kontakt aufnehmen</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Haben Sie Fragen oder möchten Sie einen Termin vereinbaren? Wir freuen uns auf Ihre Nachricht!
            </p>
          </div>
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="kontakt" className="py-16 lg:py-24 bg-sage-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-raleway text-3xl lg:text-4xl font-bold text-sage-900 mb-4">Kontakt aufnehmen</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Haben Sie Fragen oder möchten Sie einen Termin vereinbaren? Wir freuen uns auf Ihre Nachricht!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="border-sage-200">
              <CardHeader>
                <CardTitle className="font-raleway text-xl font-bold text-sage-900">Kontaktinformationen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-sage-600" />
                  <div>
                    <div className="font-medium text-sage-900">Telefon</div>
                    <div className="text-gray-600">07732-988 50 91</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-sage-600" />
                  <div>
                    <div className="font-medium text-sage-900">E-Mail</div>
                    <div className="text-gray-600">info@tierischgutbetreut.de</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-sage-600" />
                  <div>
                    <div className="font-medium text-sage-900">Standort</div>
                    <div className="text-gray-600">78345 Moos</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-sage-600" />
                  <div>
                    <div className="font-medium text-sage-900">Erreichbarkeit</div>
                    <div className="text-gray-600">Mo-So: 8:00-20:00 Uhr</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-sage-200 bg-sage-600 text-white">
              <CardContent className="p-6">
                <MessageCircle className="h-8 w-8 mb-4" />
                <h3 className="font-raleway text-lg font-bold mb-2">WhatsApp Kontakt</h3>
                <p className="text-sage-100 mb-4">Für schnelle Fragen erreichen Sie uns auch über WhatsApp.</p>
                <a href="https://wa.me/491754685977" target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    className="bg-transparent border-white text-white hover:bg-white hover:text-sage-600"
                  >
                    WhatsApp öffnen
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-sage-200">
              <CardHeader>
                <CardTitle className="font-raleway text-xl font-bold text-sage-900">Unverbindliche Anfrage</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-sage-900 mb-2">Name *</label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="border-sage-300 focus:border-sage-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sage-900 mb-2">Vorname *</label>
                      <Input
                        required
                        value={formData.vorname}
                        onChange={(e) => setFormData({ ...formData, vorname: e.target.value })}
                        className="border-sage-300 focus:border-sage-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-sage-900 mb-2">E-Mail Adresse *</label>
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="border-sage-300 focus:border-sage-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sage-900 mb-2">Telefonnummer *</label>
                      <Input
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="border-sage-300 focus:border-sage-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-sage-900 mb-2">Gewünschte Leistung</label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-3 py-2 border border-sage-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
                    >
                      <option value="">Bitte wählen</option>
                      <option value="hundepension">Hundepension</option>
                      <option value="katzenbetreuung">Mobile Katzenbetreuung</option>
                      <option value="tagesbetreuung">Tagesbetreuung</option>
                      <option value="notfall">Notfallbetreuung</option>
                    </select>
                  </div>

                  {/* Zusätzliche Felder für Hundepension */}
                  {formData.service === "hundepension" && (
                    <div className="space-y-6 p-6 bg-sage-100 rounded-lg border border-sage-300">
                      <h3 className="font-raleway text-lg font-bold text-sage-900 mb-4">Zusätzliche Informationen für die Hundepension</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-sage-900 mb-2">Anzahl der Tiere *</label>
                          <Input
                            type="number"
                            min="1"
                            required
                            value={formData.anzahlTiere}
                            onChange={(e) => setFormData({ ...formData, anzahlTiere: e.target.value })}
                            className="border-sage-300 focus:border-sage-500"
                            placeholder="z.B. 1, 2, 3"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-sage-900 mb-2">Tiername/n *</label>
                          <Input
                            required
                            value={formData.tiernamen}
                            onChange={(e) => setFormData({ ...formData, tiernamen: e.target.value })}
                            className="border-sage-300 focus:border-sage-500"
                            placeholder="z.B. Luna, Max, Bella"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-sage-900 mb-2">Alter *</label>
                          <Input
                            type="number"
                            min="0"
                            required
                            value={formData.alter}
                            onChange={(e) => setFormData({ ...formData, alter: e.target.value })}
                            className="border-sage-300 focus:border-sage-500"
                            placeholder="Alter in Jahren"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-sage-900 mb-2">Intakt/Kastriert *</label>
                          <Select
                            value={formData.intaktKastriert}
                            onValueChange={(value) => setFormData({ ...formData, intaktKastriert: value })}
                            required
                          >
                            <SelectTrigger className="border-sage-300 focus:border-sage-500">
                              <SelectValue placeholder="Bitte wählen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="intakt">Intakt</SelectItem>
                              <SelectItem value="kastriert">Kastriert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-sage-900 mb-3">
                          Wann sind Betreuungen/Urlaube geplant?
                        </label>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="schulferienBW"
                            checked={formData.schulferienBW}
                            onCheckedChange={(checked) => setFormData({ ...formData, schulferienBW: checked === true })}
                            className="border-sage-300"
                          />
                          <Label htmlFor="schulferienBW" className="text-sm text-gray-700 cursor-pointer">
                            Klassische Schulferien Baden-Württemberg
                          </Label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-sage-900 mb-3">
                          Ist schon ein konkreter Urlaub geplant? *
                        </label>
                        <RadioGroup
                          value={formData.konkreterUrlaub}
                          onValueChange={(value) => {
                            setFormData({ 
                              ...formData, 
                              konkreterUrlaub: value,
                              // Zurücksetzen der Datumsfelder wenn "Nein" gewählt wird
                              urlaubVon: value === "nein" ? "" : formData.urlaubVon,
                              urlaubBis: value === "nein" ? "" : formData.urlaubBis,
                            })
                          }}
                          className="flex gap-6"
                          required
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ja" id="urlaub-ja" className="border-sage-300" />
                            <Label htmlFor="urlaub-ja" className="text-sm text-gray-700 cursor-pointer">
                              Ja
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="nein" id="urlaub-nein" className="border-sage-300" />
                            <Label htmlFor="urlaub-nein" className="text-sm text-gray-700 cursor-pointer">
                              Nein
                            </Label>
                          </div>
                        </RadioGroup>

                        {formData.konkreterUrlaub === "ja" && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-sage-900 mb-2">
                              Urlaubszeitraum * <span className="text-gray-500 font-normal">(Von - Bis)</span>
                            </label>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-sage-900 mb-2">Von *</label>
                                <div className="relative">
                                  <Input
                                    type="date"
                                    required
                                    value={formData.urlaubVon}
                                    onChange={(e) => {
                                      setFormData({ ...formData, urlaubVon: e.target.value })
                                    }}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="border-sage-300 focus:border-sage-500 pr-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                    id="urlaubVon-input"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const input = document.getElementById('urlaubVon-input') as HTMLInputElement
                                      if (input) {
                                        if (typeof input.showPicker === 'function') {
                                          input.showPicker()
                                        } else {
                                          input.click()
                                        }
                                      }
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-600 hover:text-sage-700 cursor-pointer"
                                  >
                                    <CalendarIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-sage-900 mb-2">Bis *</label>
                                <div className="relative">
                                  <Input
                                    type="date"
                                    required
                                    value={formData.urlaubBis}
                                    onChange={(e) => {
                                      setFormData({ ...formData, urlaubBis: e.target.value })
                                    }}
                                    min={formData.urlaubVon || new Date().toISOString().split('T')[0]}
                                    className="border-sage-300 focus:border-sage-500 pr-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                    id="urlaubBis-input"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const input = document.getElementById('urlaubBis-input') as HTMLInputElement
                                      if (input) {
                                        if (typeof input.showPicker === 'function') {
                                          input.showPicker()
                                        } else {
                                          input.click()
                                        }
                                      }
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-600 hover:text-sage-700 cursor-pointer"
                                  >
                                    <CalendarIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {formData.service !== "hundepension" && (
                    <div>
                      <label className="block text-sm font-medium text-sage-900 mb-2">Ihr Tier</label>
                      <Input
                        placeholder="z.B. Hund, Katze, Name, Rasse"
                        value={formData.pet}
                        onChange={(e) => setFormData({ ...formData, pet: e.target.value })}
                        className="border-sage-300 focus:border-sage-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-sage-900 mb-2">Ihre Nachricht *</label>
                    <Textarea
                      rows={4}
                      placeholder="Erzählen Sie uns mehr über Ihr Tier und Ihre Wünsche..."
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="border-sage-300 focus:border-sage-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-sage-900 mb-2">Beste Erreichbarkeits-Zeitfenster *</label>
                    <Input
                      required
                      placeholder="z.B. Montag-Freitag 18-20 Uhr, Wochenende ganztags"
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      className="border-sage-300 focus:border-sage-500"
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="privacy"
                      required
                      checked={formData.privacy}
                      onChange={(e) => setFormData({ ...formData, privacy: e.target.checked })}
                      className="mt-1"
                    />
                    <label htmlFor="privacy" className="text-sm text-gray-600">
                      Ich stimme der Verarbeitung meiner Daten gemäß der{" "}
                      <a href="/datenschutz" className="text-sage-600 hover:underline">
                        Datenschutzerklärung
                      </a>{" "}
                      zu. *
                    </label>
                  </div>

                  {submitStatus.type && (
                    <div
                      className={`p-4 rounded-lg ${
                        submitStatus.type === 'success'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {submitStatus.message}
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-sage-600 hover:bg-sage-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Wird gesendet...' : 'Anfrage senden'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
