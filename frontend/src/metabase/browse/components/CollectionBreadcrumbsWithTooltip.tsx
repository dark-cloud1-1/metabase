import classNames from "classnames";
import type { FC } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";

import { ResponsiveContainer } from "metabase/components/ResponsiveContainer/ResponsiveContainer";
import { useAreAnyTruncated } from "metabase/hooks/use-is-truncated";
import resizeObserver from "metabase/lib/resize-observer";
import * as Urls from "metabase/lib/urls";
import type { FlexProps } from "metabase/ui";
import { FixedSizeIcon, Flex, Group, Text, Tooltip } from "metabase/ui";
import type { CollectionEssentials } from "metabase-types/api";

import { getCollectionName } from "../utils";

import {
  Breadcrumb,
  CollectionBreadcrumbsWrapper,
} from "./CollectionBreadcrumbsWithTooltip.styled";
import type { RefProp } from "./types";
import { getBreadcrumbMaxWidths } from "./utils";

const separatorCharacter = "/";

export const CollectionBreadcrumbsWithTooltip = ({
  collection,
  containerName,
}: {
  collection: CollectionEssentials;
  containerName: string;
}) => {
  const collections = (
    (collection.effective_ancestors as CollectionEssentials[]) || []
  ).concat(collection);
  const pathString = collections
    .map(coll => getCollectionName(coll))
    .join(` ${separatorCharacter} `);
  const ellipsifyPath = collections.length > 2;
  const shownCollections = ellipsifyPath
    ? [collections[0], collections[collections.length - 1]]
    : collections;
  const justOneShown = shownCollections.length === 1;

  const { areAnyTruncated, ref } = useAreAnyTruncated<HTMLAnchorElement>({
    tolerance: 1,
  });

  const initialEllipsisRef = useRef<HTMLDivElement | null>(null);
  const [
    isFirstCollectionDisplayedAsEllipsis,
    setIsFirstCollectionDisplayedAsEllipsis,
  ] = useState(false);

  useEffect(() => {
    const initialEllipsis = initialEllipsisRef.current;
    if (!initialEllipsis) {
      return;
    }
    const handleResize = () => {
      // The initial ellipsis might be hidden via CSS,
      // so we need to check whether it is displayed via getComputedStyle
      const style = window.getComputedStyle(initialEllipsis);
      setIsFirstCollectionDisplayedAsEllipsis(style.display !== "none");
    };
    resizeObserver.subscribe(initialEllipsis, handleResize);
    return () => {
      resizeObserver.unsubscribe(initialEllipsis, handleResize);
    };
  }, [initialEllipsisRef]);

  const isTooltipEnabled =
    areAnyTruncated || ellipsifyPath || isFirstCollectionDisplayedAsEllipsis;

  const maxWidths = getBreadcrumbMaxWidths(shownCollections, 96, ellipsifyPath);

  return (
    <Tooltip
      label={pathString}
      disabled={!isTooltipEnabled}
      multiline
      maw="20rem"
    >
      <ResponsiveContainer
        aria-label={pathString}
        data-testid={`breadcrumbs-for-collection: ${collection.name}`}
        name={containerName}
        w="auto"
      >
        <Flex align="center" w="100%" lh="1" style={{ flexFlow: "row nowrap" }}>
          <FixedSizeIcon name="folder" style={{ marginInlineEnd: ".5rem" }} />
          {shownCollections.map((collection, index) => {
            const key = `collection${collection.id}`;
            return (
              <Group spacing={0} style={{ flexFlow: "row nowrap" }} key={key}>
                {index > 0 && <PathSeparator />}
                <CollectionBreadcrumbsWrapper
                  containerName={containerName}
                  style={{ alignItems: "center" }}
                  w="auto"
                  display="flex"
                >
                  {index === 0 && !justOneShown && (
                    <Ellipsis
                      ref={initialEllipsisRef}
                      includeSep={false}
                      className="initial-ellipsis"
                    />
                  )}
                  {index > 0 && ellipsifyPath && <Ellipsis />}
                  <Breadcrumb
                    href={Urls.collection(collection)}
                    className={classNames("breadcrumb", `for-index-${index}`, {
                      "sole-breadcrumb": collections.length === 1,
                    })}
                    ref={(el: HTMLAnchorElement) => ref.current.set(key, el)}
                    maw={maxWidths[index]}
                    key={collection.id}
                  >
                    {getCollectionName(collection)}
                  </Breadcrumb>
                </CollectionBreadcrumbsWrapper>
              </Group>
            );
          })}
        </Flex>
      </ResponsiveContainer>
    </Tooltip>
  );
};

type EllipsisProps = {
  includeSep?: boolean;
} & FlexProps;

const Ellipsis: FC<EllipsisProps & Partial<RefProp<HTMLDivElement | null>>> =
  forwardRef<HTMLDivElement, EllipsisProps>(
    ({ includeSep = true, ...flexProps }, ref) => (
      <Flex
        ref={ref}
        align="center"
        className="ellipsis-and-separator"
        {...flexProps}
      >
        <Text lh={1}>…</Text>
        {includeSep && <PathSeparator />}
      </Flex>
    ),
  );
Ellipsis.displayName = "Ellipsis";

const PathSeparator = () => (
  <Text color="text-light" mx="xs" py={1}>
    {separatorCharacter}
  </Text>
);
