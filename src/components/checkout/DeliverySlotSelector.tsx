import { useState } from "react";
import { Clock, Zap, Calendar } from "lucide-react";

interface DeliverySlot {
  id: string;
  day: string;
  date: string;
  slots: {
    id: string;
    time: string;
    label: string;
    available: boolean;
    isFast?: boolean;
  }[];
}

const deliverySlots: DeliverySlot[] = [
  {
    id: "today",
    day: "Today",
    date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    slots: [
      { id: "express", time: "30-45 mins", label: "Express", available: true, isFast: true },
      { id: "afternoon", time: "2 PM - 5 PM", label: "Afternoon", available: true },
      { id: "evening", time: "5 PM - 8 PM", label: "Evening", available: true },
    ],
  },
  {
    id: "tomorrow",
    day: "Tomorrow",
    date: new Date(Date.now() + 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    slots: [
      { id: "morning", time: "9 AM - 12 PM", label: "Morning", available: true },
      { id: "afternoon", time: "12 PM - 3 PM", label: "Afternoon", available: true },
      { id: "evening", time: "3 PM - 6 PM", label: "Evening", available: true },
    ],
  },
];

interface DeliverySlotSelectorProps {
  onSlotSelect: (dayId: string, slotId: string) => void;
}

const DeliverySlotSelector = ({ onSlotSelect }: DeliverySlotSelectorProps) => {
  const [selectedDay, setSelectedDay] = useState("today");
  const [selectedSlot, setSelectedSlot] = useState("express");

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId);
    onSlotSelect(selectedDay, slotId);
  };

  const handleDaySelect = (dayId: string) => {
    setSelectedDay(dayId);
    const firstAvailable = deliverySlots.find(d => d.id === dayId)?.slots.find(s => s.available);
    if (firstAvailable) {
      setSelectedSlot(firstAvailable.id);
      onSlotSelect(dayId, firstAvailable.id);
    }
  };

  const currentDaySlots = deliverySlots.find((d) => d.id === selectedDay);

  return (
    <div className="space-y-4">
      {/* Day selector */}
      <div className="flex gap-3">
        {deliverySlots.map((day) => (
          <button
            key={day.id}
            onClick={() => handleDaySelect(day.id)}
            className={`flex flex-1 flex-col items-center rounded-xl border-2 px-4 py-3 transition-all ${
              selectedDay === day.id
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <Calendar className={`mb-1 h-5 w-5 ${selectedDay === day.id ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`font-display text-sm font-semibold ${selectedDay === day.id ? "text-primary" : "text-foreground"}`}>
              {day.day}
            </span>
            <span className="font-body text-xs text-muted-foreground">{day.date}</span>
          </button>
        ))}
      </div>

      {/* Time slots */}
      <div className="grid gap-3 sm:grid-cols-3">
        {currentDaySlots?.slots.map((slot) => (
          <button
            key={slot.id}
            onClick={() => slot.available && handleSlotSelect(slot.id)}
            disabled={!slot.available}
            className={`relative flex flex-col items-center rounded-xl border-2 px-4 py-4 transition-all ${
              !slot.available
                ? "cursor-not-allowed border-border bg-muted/50 opacity-50"
                : selectedSlot === slot.id
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            {slot.isFast && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase text-secondary-foreground">
                Fastest
              </div>
            )}
            {slot.isFast ? (
              <Zap className={`mb-2 h-5 w-5 ${selectedSlot === slot.id ? "text-secondary" : "text-secondary"}`} />
            ) : (
              <Clock className={`mb-2 h-5 w-5 ${selectedSlot === slot.id ? "text-primary" : "text-muted-foreground"}`} />
            )}
            <span className={`font-display text-sm font-semibold ${selectedSlot === slot.id ? "text-primary" : "text-foreground"}`}>
              {slot.label}
            </span>
            <span className="font-body text-xs text-muted-foreground">{slot.time}</span>
          </button>
        ))}
      </div>

      {/* Selected slot summary */}
      {selectedSlot === "express" && selectedDay === "today" && (
        <div className="flex items-center gap-2 rounded-lg bg-secondary/10 px-4 py-3">
          <Zap className="h-5 w-5 text-secondary" />
          <div>
            <p className="font-body text-sm font-semibold text-foreground">
              Express Delivery in 30-45 mins
            </p>
            <p className="font-body text-xs text-muted-foreground">
              Get your order delivered super fast!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliverySlotSelector;
