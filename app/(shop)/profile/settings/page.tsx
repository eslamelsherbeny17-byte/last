"use client"

import { useState } from "react"
import { Bell, Lock, Globe, Eye } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function SettingsPage() {
  const { t, language } = useLanguage()
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotions: true,
    newsletter: false,
    twoFactor: false,
  })

  const handleSave = () => {
    console.log("Save settings:", settings)
    toast.success(t("success"))
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold dark:text-gray-100">{t("settings")}</h2>

      {/* Notifications */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            {t("settings")}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">{t("settings")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <Label className="text-sm sm:text-base">{t("email")}</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("email")}</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
            />
          </div>

          <Separator className="dark:bg-gray-700" />

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <Label className="text-sm sm:text-base">{t("phone")}</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("phone")}</p>
            </div>
            <Switch
              checked={settings.smsNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
            />
          </div>

          <Separator className="dark:bg-gray-700" />

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <Label className="text-sm sm:text-base">{t("myOrders")}</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("orderStatus")}</p>
            </div>
            <Switch
              checked={settings.orderUpdates}
              onCheckedChange={(checked) => setSettings({ ...settings, orderUpdates: checked })}
            />
          </div>

          <Separator className="dark:bg-gray-700" />

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <Label className="text-sm sm:text-base">{t("discount")}</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("discount")}</p>
            </div>
            <Switch
              checked={settings.promotions}
              onCheckedChange={(checked) => setSettings({ ...settings, promotions: checked })}
            />
          </div>

          <Separator className="dark:bg-gray-700" />

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <Label className="text-sm sm:text-base">{t("newsletter")}</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("subscribeNewsletter")}</p>
            </div>
            <Switch
              checked={settings.newsletter}
              onCheckedChange={(checked) => setSettings({ ...settings, newsletter: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
            {t("securePayments")}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">{t("securePayments")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <Label className="text-sm sm:text-base">{t("password")}</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("changePassword")}</p>
            </div>
            <Switch
              checked={settings.twoFactor}
              onCheckedChange={(checked) => setSettings({ ...settings, twoFactor: checked })}
            />
          </div>

          <Separator className="dark:bg-gray-700" />

          <div>
            <Button variant="outline" className="w-full justify-start text-sm sm:text-base h-10 sm:h-11">
              <Eye className="ml-2 h-4 w-4" />
              {t("viewDetails")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Language & Region */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
            {t("settings")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm sm:text-base">{t("settings")}</Label>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {language === "ar" ? "العربية" : "English"}
              </p>
            </div>
            <div>
              <Label className="text-sm sm:text-base">{t("city")}</Label>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t("cairo")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          size="lg"
          className="gold-gradient w-full sm:w-auto text-sm sm:text-base h-11 sm:h-12"
        >
          {t("save")}
        </Button>
      </div>
    </div>
  )
}
