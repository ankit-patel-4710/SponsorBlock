import * as React from "react";
import Config from "../config";
import { Category, SegmentUUID, SponsorTime } from "../types";

import ThumbsUpSvg from "../svg-icons/thumbs_up_svg";
import ThumbsDownSvg from "../svg-icons/thumbs_down_svg";
import { downvoteButtonColor, SkipNoticeAction } from "../utils/noticeUtils";
import { VoteResponse } from "../messageTypes";
import { AnimationUtils } from "../utils/animationUtils";
import { GenericUtils } from "../utils/genericUtils";

export interface CategoryPillProps {
    vote: (type: number, UUID: SegmentUUID, category?: Category) => Promise<VoteResponse>;
}

export interface CategoryPillState {
    segment?: SponsorTime;
    show: boolean;
    open?: boolean;
}

class CategoryPillComponent extends React.Component<CategoryPillProps, CategoryPillState> {

    constructor(props: CategoryPillProps) {
        super(props);

        this.state = {
            segment: null,
            show: false,
            open: false
        };
    }

    render(): React.ReactElement {
        const style: React.CSSProperties = {
            backgroundColor: Config.config.barTypes["preview-" + this.state.segment?.category]?.color,
            display: this.state.show ? "flex" : "none"
        }

        return (
            <span style={style}
                className={"sponsorBlockCategoryPill"} 
                onClick={() => this.state.show && this.setState({ open: !this.state.open })}>
                <span className="sponsorBlockCategoryPillTitleSection">
                    <img className="sponsorSkipLogo sponsorSkipObject"
                        src={chrome.extension.getURL("icons/IconSponsorBlocker256px.png")}>
                    </img>
                    <span className="sponsorBlockCategoryPillTitle">
                        {chrome.i18n.getMessage("category_" + this.state.segment?.category)}
                    </span>
                </span>

                {this.state.open && (
                    <>
                        {/* Upvote Button */}
                        <div id={"sponsorTimesDownvoteButtonsContainerUpvoteCategoryPill"}
                                className="voteButton"
                                style={{marginLeft: "5px"}}
                                title={chrome.i18n.getMessage("upvoteButtonInfo")}
                                onClick={(event) => this.vote(event, 1)}>
                            <ThumbsUpSvg fill={Config.config.colorPalette.white} />
                        </div>

                        {/* Downvote Button */}
                        <div id={"sponsorTimesDownvoteButtonsContainerDownvoteCategoryPill"}
                                className="voteButton"
                                title={chrome.i18n.getMessage("reportButtonInfo")}
                                onClick={(event) => this.vote(event, 0)}>
                            <ThumbsDownSvg fill={downvoteButtonColor(null, null, SkipNoticeAction.Downvote)} />
                        </div>
                    </>
                )}
            </span>
        );
    }

    private async vote(event: React.MouseEvent, type: number): Promise<void> {
        event.stopPropagation();
        if (this.state.segment) {
            const stopAnimation = AnimationUtils.applyLoadingAnimation(event.currentTarget as HTMLElement, 0.3);

            const response = await this.props.vote(type, this.state.segment.UUID);
            await stopAnimation();

            if (response.successType == 1 || (response.successType == -1 && response.statusCode == 429)) {
                this.setState({ open: false });
            } else if (response.statusCode !== 403) {
                alert(GenericUtils.getErrorMessage(response.statusCode, response.responseText));
            }
        }
    }
}

export default CategoryPillComponent;
