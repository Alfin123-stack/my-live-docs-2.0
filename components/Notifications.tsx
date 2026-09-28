'use client'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { InboxNotification, InboxNotificationList, LiveblocksUiConfig } from "@liveblocks/react-ui"
import { useInboxNotifications, useUnreadInboxNotificationsCount } from "@liveblocks/react/suspense"
import { useMarkAllInboxNotificationsAsRead } from "@liveblocks/react"
import { Bell } from "lucide-react"
import { ReactNode } from "react"
import { useLocale, useTranslations } from "next-intl"
import { UserAvatar } from "@/components/UserAvatar"
import { Button } from "@/components/ui/button"

const Notifications = () => {
  const t = useTranslations("Notifications");
  const locale = useLocale();
  const { inboxNotifications } = useInboxNotifications();
  const { count } = useUnreadInboxNotificationsCount();
  const markAllAsRead = useMarkAllInboxNotificationsAsRead();

  const unreadNotifications = inboxNotifications.filter((notification) => !notification.readAt);

  return (
    <Popover>
      <PopoverTrigger aria-label={count > 0 ? t("unread", { count }) : t("title")} className="icon-btn relative">
        <Bell className="size-[18px]" aria-hidden />
        {count > 0 && (
          <span aria-hidden className="absolute right-1.5 top-1.5 z-20 size-2.5 rounded-full border-2 border-card bg-action" />
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="shad-popover">
        <LiveblocksUiConfig 
          overrides={{
            INBOX_NOTIFICATION_TEXT_MENTION: (user: ReactNode) => (
              <>{user} {t("mentionedYou")}</>
            )
          }}
        >
          {unreadNotifications.length > 0 && (
            <div className="mb-1 flex justify-end">
              <Button
                onClick={() => markAllAsRead()}
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-violet-ink"
              >
                {t("markAllRead")}
              </Button>
            </div>
          )}

          <InboxNotificationList>
            {unreadNotifications.length <= 0 && (
              <p className="py-2 text-center text-muted">{t("empty")}</p>
            )}

            {unreadNotifications.length > 0 && unreadNotifications.map((notification) => (
              <InboxNotification 
                key={notification.id}
                inboxNotification={notification}
                className="bg-card text-ink"
                href={`/${locale}/documents/${notification.roomId}`}
                showActions={false}
                kinds={{
                  thread: (props) => (
                    <InboxNotification.Thread {...props} 
                      showActions={false}
                      showRoomName={false}
                    />
                  ),
                  textMention: (props) => (
                    <InboxNotification.TextMention {...props} 
                      showRoomName={false}
                    />
                  ),
                  $documentAccess: (props) => {
                    const data = props.inboxNotification.activities[0].data;
                    return (
                      <InboxNotification.Custom
                        {...props}
                        title={
                          data.title
                            ? String(data.title)
                            : t("accessGranted", {
                                name: String(data.updatedBy ?? ""),
                                type: data.userType === "editor" ? t("editor") : t("viewer"),
                              })
                        }
                        aside={
                          <InboxNotification.Icon className="bg-transparent">
                            <UserAvatar name={String(data.updatedBy ?? "")} email={String(data.email ?? "")} size={36} />
                          </InboxNotification.Icon>
                        }
                      >
                        {props.children}
                      </InboxNotification.Custom>
                    );
                  },
                }}
              />
            ))}
          </InboxNotificationList>
        </LiveblocksUiConfig>
      </PopoverContent>
    </Popover>
  )
}

export default Notifications