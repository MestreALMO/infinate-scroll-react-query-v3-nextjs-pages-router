import { useInfiniteQuery } from "react-query";
import fetchData from "../utils/fetchData";
import { useCallback, useMemo, useRef } from "react";
import Link from "next/link";

export default function Home() {
  const { data, error, fetchNextPage, hasNextPage, isFetching, isLoading } =
    useInfiniteQuery("projects", fetchData, {
      getNextPageParam: (lastPage, pages) => lastPage.offset,
    });

  /**
   * Data is typically an array of pages,
   * where each page contains an array of items.
   * In order to easily map through and render these items,
   * we can flatten the data into a single array.
   */
  const flattenedData = useMemo(
    () => (data ? data?.pages.flatMap((item) => item.results) : []),
    [data]
  );

  /**
   * Ref for our intersectionObserver that will be attached to the last element in the list
   */
  const observer = useRef<IntersectionObserver>();

  /**
   * Logic to call fetchNextPage when the last element is visible on the screen
   */
  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      //Return if already fetching
      if (isLoading || isFetching) return;

      // Disconnect if already observer exists
      if (observer.current) observer.current.disconnect();

      //Create new observer for the last element, and call fetchNextPage if visible(isIntersecting)
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasNextPage]
  );

  /**
   * Will be true only for the initial load
   */
  if (isLoading) return <h1>Loading Data</h1>;

  /**
   * Show error if the API fails
   */
  if (error) return <h1>Couldn't fetch data</h1>;

  return (
    <main>
      <Link href="youtube.com/@DeveloperALMO">
        <h1>youtube.com/@DeveloperALMO</h1>
      </Link>
      <div>
        {flattenedData.map((item, i) => (
          <div
            key={i}
            ref={flattenedData.length === i + 1 ? lastElementRef : null}
          >
            <p>{item.name}</p>
          </div>
        ))}
      </div>
      {isFetching && <div>Fetching more data</div>}

      <p>
        An adaptation to NextJS of:
        <Link href="https://www.antstack.com/blog/implementing-infinite-scroll-pagination-with-react-query-v3/">
          Implementing Infinite Scroll Pagination with React-Query v3
        </Link>
      </p>
    </main>
  );
}
