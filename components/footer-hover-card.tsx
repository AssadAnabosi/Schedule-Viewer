"use client";

import {
  EnvelopeClosedIcon,
  GitHubLogoIcon,
  LinkedInLogoIcon,
} from "@radix-ui/react-icons";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export default function FooterHoverCard() {
  return (
    <footer className="flex flex-col items-center text-sm">
      <HoverCard>
        <HoverCardTrigger asChild>
          <span>
            Created by
            <Button variant="link" asChild className="px-1">
              <a href="https://assad.anabosi.com" target="_blank">
                @assadanabosi
              </a>
            </Button>
          </span>
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="flex space-x-4">
            <Avatar className="aspect-square">
              <AvatarImage src="/avatar.jpeg" />
              <AvatarFallback>AA</AvatarFallback>
            </Avatar>
            <div className="space-y">
              <h4 className="text-sm font-semibold">Assad Anabosi</h4>
              <p className="text-xs text-muted-foreground">
                CSE Student at Arab American University
              </p>
              <div className="flex items-center gap-3">
                <Button asChild variant="link" className="p-0">
                  <a
                    href="https://linkedin.com/in/assadanabosi"
                    target="_blank"
                  >
                    <LinkedInLogoIcon className="mr-2 h-4 w-4 opacity-70" />
                  </a>
                </Button>
                <Button asChild variant="link" className="p-0">
                  <a href="https://github.com/assadanabosi" target="_blank">
                    <GitHubLogoIcon className="mr-2 h-4 w-4 opacity-70" />
                  </a>
                </Button>
                <Button asChild variant="link" className="p-0">
                  <a href="mailto:assad@anabosi.com">
                    <EnvelopeClosedIcon className="mr-2 h-4 w-4 opacity-70" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
      <span className="pb-2 text-xs text-muted-foreground">
        Great help from{" "}
        <a
          className="font-medium text-primary underline-offset-4 hover:underline"
          href="https://v0.dev/"
          target="_blank"
        >
          v0.dev
        </a>
      </span>
    </footer>
  );
}
