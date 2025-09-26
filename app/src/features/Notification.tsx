
interface NotificationProps {
    notification: string;
  }
  
  export const Notification = ({ notification }: NotificationProps) => {
    return (
      <div id="notification-toast" className={notification ? "show" : ""}>
        <span>{notification}</span>
      </div>
    );
  };
