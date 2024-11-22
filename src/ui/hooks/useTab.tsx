import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export function useTabs() {

  // State to manage the global split level and depth of tabs
  const [globalSplitLevel, setGlobalSplitLevel] = useState(0);
  const [globalDepth, setGlobalDepth] = useState(0);

  // Function to create a default child object for a tab
  const createDefaultChild = (
    tabId: string,
    type: "ai" | "editor" | "terminal" | "preview",
    splitLevel: number,
    depth: number,
    direction: "horizontal" | "vertical"
  ): ChildData => ({
    id: `${tabId}-${type}-${splitLevel}-${depth}`,
    type,
    content: [],
    splitLevel,
    contentType: type,
    depth,
    direction,
  });

  // Function to create a default tab object
  const createDefaultTab = (
    type: "ai" | "editor" | "terminal" | "preview" = "terminal",
    filePath?: string
  ): TabData => {
    const tabId = uuidv4();

    const defaultChild = createDefaultChild(tabId, type, 0, 0, "horizontal");

    if (filePath) {
      defaultChild.filePath = filePath;
    }

    return {
      id: tabId,
      name: "~",
      children: [defaultChild],
      splitLevel: 0,
      isSudoPassword: false,
    };
  };

  // State to manage the list of tabs and the active tab ID
  const [tabs, setTabs] = useState<TabData[]>(() => {
    const savedTabs = sessionStorage.getItem("tabs");
    return savedTabs ? JSON.parse(savedTabs) : [createDefaultTab()];
  });

  const [activeTabId, setActiveTabId] = useState<string>(() => {
    const savedActiveTabId = sessionStorage.getItem("activeTabId");
    return savedActiveTabId || tabs[0].id;
  });

  // Effect to save tabs and active tab ID to session storage whenever they change
  useEffect(() => {
    sessionStorage.setItem("tabs", JSON.stringify(tabs));
    sessionStorage.setItem("activeTabId", activeTabId);
  }, [tabs, activeTabId]);

  // Function to add a new tab
  const addTab = () => {
    const newTab = createDefaultTab();

    setTabs((prevTabs) => {
      const updatedTabs = [...prevTabs, newTab];
      sessionStorage.setItem("tabs", JSON.stringify(updatedTabs));
      return updatedTabs;
    });

    setActiveTabId(newTab.id);
  };

  // Function to add a new tab and return its ID
  const addTabAndReturnId = (
    filePath?: string,
    type: "ai" | "editor" | "terminal" | "preview" = "terminal"
  ): string => {
    const newTab = createDefaultTab(type, filePath);
    setTabs((prevTabs) => [...prevTabs, newTab]);
    setActiveTabId(newTab.id);

    return newTab.id;
  };

  // Function to remove a tab by its ID
  const removeTab = (id: string) => {
    setTabs((prevTabs) => {
      const newTabs = prevTabs.filter((tab) => tab.id !== id);
      const newActiveId =
        id === activeTabId && newTabs.length > 0
          ? newTabs[newTabs.length - 1].id
          : activeTabId;

      setActiveTabId(newActiveId);
      return newTabs;
    });
  };

  // Function to handle tab change by setting the active tab ID
  const handleTabChange = (id: string) => {
    setActiveTabId(id);
  };

  // Function to split a child within a tab and return the new child's ID
  const splitChild = useCallback(
    (
      tabId: string,
      childId: string,
      direction: "horizontal" | "vertical",
      type: "ai" | "editor" | "terminal" | "preview" = "terminal"
    ): string => {
      let newChildId: string = "";

      setTabs((prevTabs) => {
        const updatedTabs = prevTabs.map((tab) => {
          if (tab.id !== tabId) return tab;

          const updateChildren = (children: ChildData[]): ChildData[] => {
            return children.flatMap((child) => {
              if (child.id === childId) {
                const newSplitLevel =
                  direction === "horizontal"
                    ? child.splitLevel + 1
                    : child.splitLevel;
                const newDepth =
                  direction === "vertical" ? child.depth + 1 : child.depth;

                const newChild = createDefaultChild(
                  tabId,
                  type,
                  newSplitLevel,
                  newDepth,
                  direction
                );
                newChildId = newChild.id;

                return [
                  {
                    ...child,
                    splitLevel: newSplitLevel,
                    depth: newDepth,
                    direction,
                  },
                  newChild,
                ];
              }
              return [child];
            });
          };

          const updatedChildren = updateChildren(tab.children);
          return { ...tab, children: updatedChildren };
        });

        sessionStorage.setItem("tabs", JSON.stringify(updatedTabs));

        return updatedTabs;
      });

      return newChildId;
    },
    []
  );

  // Function to close a child within a tab
  const closeChild = (tabId: string, childId: string) => {
    setTabs((prevTabs) => {
      const updatedTabs = prevTabs.map((tab) => {
        if (tab.id !== tabId) return tab;

        const filteredChildren = tab.children.filter(
          (child) => child.id !== childId
        );

        if (filteredChildren.length === 0) {
          const newChild = createDefaultChild(
            tabId,
            "terminal",
            0,
            0,
            "horizontal"
          );
          return { ...tab, children: [newChild] };
        }

        return { ...tab, children: filteredChildren };
      });

      sessionStorage.setItem("tabs", JSON.stringify(updatedTabs));

      return updatedTabs;
    });
  };

  // Function to update a child's data within a tab
  const updateChildData = (
    tabId: string,
    childId: string,
    newData: { contentType: "ai" | "editor" | "terminal" | "preview" },
    filePath?: string
  ) => {
    setTabs((prevTabs) => {
      const updatedTabs = prevTabs.map((tab) => {
        if (tab.id !== tabId) return tab;

        const updatedChildren = tab.children.map((child) => {
          if (child.id === childId) {
            // Create a new id based on the new contentType
            const newId = `${tabId}-${newData.contentType}-${child.splitLevel}-${child.depth}`;
            return {
              ...child,
              id: newId,
              contentType: newData.contentType,
              type: newData.contentType,
              filePath: filePath,
              content: [],
            };
          }
          return child;
        });

        return { ...tab, children: updatedChildren };
      });

      sessionStorage.setItem("tabs", JSON.stringify(updatedTabs));

      return updatedTabs;
    });
  };

  // Function to update a tab's name
  const updateTabName = (id: string, newName: string) => {
    setTabs((prevTabs) => {
      const updatedTabs = prevTabs.map((tab) =>
        tab.id === id ? { ...tab, name: newName } : tab
      );
      sessionStorage.setItem("tabs", JSON.stringify(updatedTabs));

      return updatedTabs;
    });
  };

  // Function to add terminal data to a child within a tab
  const addTerminalData = (
    tabId: string,
    childId: string,
    data: TerminalData
  ) => {
    setTabs((prevTabs) => {
      const updatedTabs = prevTabs.map((tab) => {
        if (tab.id !== tabId) {
          return tab;
        }

        const updatedChildren = tab.children.map((child) => {
          if (
            child.id === childId &&
            (child.contentType === "terminal" || child.contentType === "ai")
          ) {
            return {
              ...child,
              content: [...child.content, data],
            };
          }
          return child;
        });

        return { ...tab, children: updatedChildren };
      });
      sessionStorage.setItem("tabs", JSON.stringify(updatedTabs));

      return updatedTabs;
    });
  };

  // Function to add preview code to a child within a tab
  const addPreviewCode = useCallback(
    (tabId: string, childId: string, data: PreviewData[]) => {
      setTabs((prevTabs) => {
        const updatedTabs = prevTabs.map((tab) => {
          if (tab.id !== tabId) return tab;

          const updatedChildren = tab.children.map((child) => {
            if (child.id === childId && child.contentType === "preview") {
              const updatedPreview = Array.isArray(child.preview)
                ? [...child.preview, ...data]
                : [...data];

              return {
                ...child,
                preview: updatedPreview,
              };
            }

            return child;
          });

          return { ...tab, children: updatedChildren };
        });
        sessionStorage.setItem("tabs", JSON.stringify(updatedTabs));
        return updatedTabs;
      });
    },
    []
  );

  // Function to clear terminal data from a child within a tab
  const clearTerminalData = (tabId: string, childId: string) => {
    setTabs((prevTabs) => {
      const updatedTabs = prevTabs.map((tab) => {
        if (tab.id !== tabId) return tab;

        const updatedChildren = tab.children.map((child) => {
          if (
            child.id === childId &&
            (child.contentType === "terminal" || child.contentType === "ai")
          ) {
            return {
              ...child,
              content: [],
            };
          }
          return child;
        });

        return { ...tab, children: updatedChildren };
      });
      sessionStorage.setItem("tabs", JSON.stringify(updatedTabs));
      return updatedTabs;
    });
  };

  // Function to split a child and add preview code within a tab
  const splitChildAndAddPreview = useCallback(
    (
      tabId: string,
      childId: string,
      direction: "horizontal" | "vertical",
      codeBlocks: PreviewData[]
    ): string => {
      let newChildId: string = "";

      setTabs((prevTabs) => {
        const updatedTabs = prevTabs.map((tab) => {
          if (tab.id !== tabId) return tab;

          const updateChildren = (children: ChildData[]): ChildData[] => {
            return children.flatMap((child) => {
              if (child.id === childId) {
                const newSplitLevel =
                  direction === "horizontal"
                    ? child.splitLevel + 1
                    : child.splitLevel;
                const newDepth =
                  direction === "vertical" ? child.depth + 1 : child.depth;

                const newChild: ChildData = {
                  id: `${tabId}-preview-${newSplitLevel}-${newDepth}`,
                  type: "preview",
                  content: [],
                  preview: codeBlocks,
                  splitLevel: newSplitLevel,
                  contentType: "preview",
                  depth: newDepth,
                  direction: direction,
                };
                newChildId = newChild.id;

                return [
                  {
                    ...child,
                    splitLevel: newSplitLevel,
                    depth: newDepth,
                    direction,
                  },
                  newChild,
                ];
              }
              return [child];
            });
          };

          const updatedChildren = updateChildren(tab.children);
          return { ...tab, children: updatedChildren };
        });
        sessionStorage.setItem("tabs", JSON.stringify(updatedTabs));

        return updatedTabs;
      });

      return newChildId;
    },
    []
  );

  const setSudoPasswordTab = (tabId: string, password: string) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.id !== tabId) {
          return tab;
        }

        return {
          ...tab,
          isSudoPassword: true,
          sudoPassword: password,
        };
      })
    );
  };

  // Function to check if a tab is a sudo password tab
  const getIsSudoPassword = (tabId: string): boolean => {
    const tab = tabs.find((tab) => tab.id === tabId);
    return tab ? tab.isSudoPassword : false;
  };

  // Function to get the sudo password of a tab
  const getSudoPassword = (tabId: string): string => {
    const tab = tabs.find((tab) => tab.id === tabId);
    return tab ? tab.sudoPassword : "";
  };

  // Function to update streaming content for a child within a tab
  const updateStreamingContent = useCallback(
    (tabId: string, childId: string, newContent: string) => {
      setTabs((prevTabs) => {
        const updatedTabs = prevTabs.map((tab) => {
          if (tab.id !== tabId) return tab;

          const updatedChildren = tab.children.map((child) => {
            if (child.id === childId) {
              const existingContent = child?.streamingContent || "";
              const updatedContent = existingContent + newContent;
              return {
                ...child,
                streamingContent: updatedContent,
              };
            }
            return child;
          });

          return { ...tab, children: updatedChildren };
        });

        sessionStorage.setItem("tabs", JSON.stringify(updatedTabs));

        return updatedTabs;
      });
    },
    []
  );

  // Function to clear streaming content from a child within a tab
  const clearStreamingContent = useCallback(
    (tabId: string, childId: string) => {
      setTabs((prevTabs) => {
        const updatedTabs = prevTabs.map((tab) => {
          if (tab.id !== tabId) return tab;
          const updatedChildren = tab.children.map((child) => {
            if (
              child.id === childId &&
              (child.contentType === "terminal" || child.contentType === "ai")
            ) {
              return {
                ...child,
                streamingContent: undefined,
              };
            }
            return child;
          });
          return { ...tab, children: updatedChildren };
        });

        sessionStorage.setItem("tabs", JSON.stringify(updatedTabs));

        return updatedTabs;
      });
    },
    []
  );

  return {
    tabs,
    activeTabId,
    addTab,
    removeTab,
    handleTabChange,
    splitChild,
    closeChild,
    updateChildData,
    updateTabName,
    addTerminalData,
    addTabAndReturnId,
    clearTerminalData,
    addPreviewCode,
    splitChildAndAddPreview,
    setSudoPasswordTab,
    getIsSudoPassword,
    getSudoPassword,
    updateStreamingContent,
    clearStreamingContent,
  };
}
