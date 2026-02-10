import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Lead } from "@/hooks/useLeads";

export default function ClaimedLeadsSection({ leads }: { leads: Lead[] }) {
  const [open, setOpen] = useState(true);

  return (
    <Card className="glass-card metric-shadow overflow-hidden">
      <button
        onClick={() => leads.length > 0 && setOpen(!open)}
        className={`w-full text-left px-5 py-4 flex items-center justify-between group transition-colors ${
          leads.length > 0 ? "cursor-pointer hover:bg-accent/30" : "cursor-default"
        }`}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </motion.div>
          <Users className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold tracking-tight">Claimed Leads</span>
        </div>
        <Badge variant="secondary" className="font-mono text-xs px-2.5 font-bold">
          {leads.length}
        </Badge>
      </button>
      <AnimatePresence>
        {open && leads.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-1.5 max-h-[400px] overflow-y-auto">
              {leads.map((lead, i) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, type: "spring", stiffness: 300, damping: 25 }}
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-border/30 bg-card/60 hover:bg-accent/20 hover:border-primary/20 transition-all duration-200 group/item"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold tracking-tight truncate group-hover/item:text-primary transition-colors">
                      {lead.company_name || "—"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {lead.poc_name || "No POC"}{lead.poc_title ? ` · ${lead.poc_title}` : ""}
                    </p>
                  </div>
                  {lead.status && (
                    <Badge variant="outline" className="text-[10px] shrink-0 ml-2 font-medium">
                      {lead.status}
                    </Badge>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
